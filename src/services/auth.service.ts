import { supabase } from './supabase';
import type { AdminUser } from '../types';

/**
 * Interface for profile update data
 */
export interface ProfileUpdateData {
  name?: string;
  email?: string;
}

/**
 * Interface for tracking failed login attempts
 */
interface FailedLoginAttempt {
  count: number;
  lastAttempt: number;
  lockedUntil?: number;
}

/**
 * Authentication Service
 * Handles user authentication, session management, and security features
 */
export class AuthService {
  private failedAttempts: Map<string, FailedLoginAttempt> = new Map();
  private readonly MAX_FAILED_ATTEMPTS = 3;
  private readonly LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

  /**
   * Check if an account is locked due to failed login attempts
   */
  private isAccountLocked(email: string): boolean {
    const attempt = this.failedAttempts.get(email);
    if (!attempt || !attempt.lockedUntil) return false;

    const now = Date.now();
    if (now < attempt.lockedUntil) {
      return true;
    }

    // Lock expired, clear it
    this.failedAttempts.delete(email);
    return false;
  }

  /**
   * Get remaining lockout time in minutes
   */
  private getRemainingLockoutTime(email: string): number {
    const attempt = this.failedAttempts.get(email);
    if (!attempt || !attempt.lockedUntil) return 0;

    const remaining = Math.ceil((attempt.lockedUntil - Date.now()) / 60000);
    return Math.max(0, remaining);
  }

  /**
   * Record a failed login attempt
   */
  private recordFailedAttempt(email: string): void {
    const now = Date.now();
    const attempt = this.failedAttempts.get(email);

    if (!attempt) {
      this.failedAttempts.set(email, {
        count: 1,
        lastAttempt: now,
      });
      return;
    }

    // Reset count if last attempt was more than 15 minutes ago
    if (now - attempt.lastAttempt > this.LOCKOUT_DURATION) {
      this.failedAttempts.set(email, {
        count: 1,
        lastAttempt: now,
      });
      return;
    }

    // Increment failed attempt count
    attempt.count += 1;
    attempt.lastAttempt = now;

    // Lock account if max attempts reached
    if (attempt.count >= this.MAX_FAILED_ATTEMPTS) {
      attempt.lockedUntil = now + this.LOCKOUT_DURATION;
    }

    this.failedAttempts.set(email, attempt);
  }

  /**
   * Clear failed login attempts for an email
   */
  private clearFailedAttempts(email: string): void {
    this.failedAttempts.delete(email);
  }

  /**
   * Log authentication event to audit logs
   */
  private async logAuthEvent(
    adminUserId: string | null,
    actionType: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      await supabase.from('audit_logs').insert({
        admin_user_id: adminUserId,
        action_type: actionType,
        entity_type: 'auth',
        new_values: metadata,
      });
    } catch (error) {
      console.error('Failed to log auth event:', error);
      // Don't throw - logging failure shouldn't break auth flow
    }
  }

  /**
   * Login with email and password
   * Implements security features:
   * - Account lockout after 3 failed attempts in 15 minutes
   * - Failed attempt tracking
   * - Audit logging
   */
  async login(email: string, password: string): Promise<AdminUser> {
    try {
      // Validate input
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      // Check if account is locked
      if (this.isAccountLocked(email)) {
        const remainingTime = this.getRemainingLockoutTime(email);
        await this.logAuthEvent(null, 'login_attempt_locked', {
          email,
          remainingLockoutMinutes: remainingTime,
        });
        throw new Error(
          `Account is locked due to multiple failed login attempts. Please try again in ${remainingTime} minute(s).`
        );
      }

      // Authenticate with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        // Record failed attempt
        this.recordFailedAttempt(email);
        
        await this.logAuthEvent(null, 'login_failed', {
          email,
          reason: authError.message,
        });

        // Check if account is now locked
        if (this.isAccountLocked(email)) {
          const remainingTime = this.getRemainingLockoutTime(email);
          throw new Error(
            `Too many failed login attempts. Account locked for ${remainingTime} minute(s).`
          );
        }

        throw new Error('Invalid email or password');
      }

      if (!authData.user) {
        this.recordFailedAttempt(email);
        throw new Error('Authentication failed');
      }

      // Fetch admin user details
      const { data: adminUser, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', authData.user.email)
        .single();

      if (adminError || !adminUser) {
        // Sign out the user since they're not an admin
        await supabase.auth.signOut();
        this.recordFailedAttempt(email);
        
        await this.logAuthEvent(null, 'login_failed', {
          email,
          reason: 'Admin user not found',
        });
        
        throw new Error('Admin user not found');
      }

      // Clear failed attempts on successful login
      this.clearFailedAttempts(email);

      // Update last login timestamp
      await supabase
        .from('admin_users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', adminUser.id);

      // Log successful authentication
      await this.logAuthEvent(adminUser.id, 'login_success', {
        email: adminUser.email,
        role: adminUser.role,
      });

      return adminUser;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Logout current user
   * Invalidates the authentication token
   */
  async logout(): Promise<void> {
    try {
      // Get current user before logout for audit log
      const currentUser = await this.getCurrentUser();

      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Log logout event
      if (currentUser) {
        await this.logAuthEvent(currentUser.id, 'logout', {
          email: currentUser.email,
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  /**
   * Get current authenticated user
   * Checks session validity and returns admin user details
   */
  async getCurrentUser(): Promise<AdminUser | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) return null;

      // Check session timeout (24 hours of inactivity)
      // Supabase handles this automatically with token expiration
      // but we can add additional checks here if needed

      const { data: adminUser, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', session.user.email)
        .single();

      if (error || !adminUser) return null;

      return adminUser;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  /**
   * Update admin user profile
   * Allows updating name and email
   */
  async updateProfile(data: ProfileUpdateData): Promise<AdminUser> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get current admin user
      const { data: currentAdmin } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', user.email)
        .single();

      if (!currentAdmin) throw new Error('Admin user not found');

      // Update auth email if changed
      if (data.email && data.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: data.email,
        });
        if (emailError) throw emailError;
      }

      // Prepare update data
      const updateData: Partial<AdminUser> = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.email !== undefined) updateData.email = data.email;

      // Update admin_users record
      const { data: adminUser, error } = await supabase
        .from('admin_users')
        .update(updateData)
        .eq('id', currentAdmin.id)
        .select()
        .single();

      if (error || !adminUser) throw error || new Error('Update failed');

      // Log profile update
      await this.logAuthEvent(adminUser.id, 'profile_updated', {
        previous_values: {
          name: currentAdmin.name,
          email: currentAdmin.email,
        },
        new_values: updateData,
      });

      return adminUser;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  /**
   * Change password
   * Requires current password for verification and validates new password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      // Validate input
      if (!currentPassword || !newPassword) {
        throw new Error('Current password and new password are required');
      }

      // Validate new password strength
      if (newPassword.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      if (!/[A-Z]/.test(newPassword)) {
        throw new Error('Password must contain at least one uppercase letter');
      }

      if (!/[a-z]/.test(newPassword)) {
        throw new Error('Password must contain at least one lowercase letter');
      }

      if (!/[0-9]/.test(newPassword)) {
        throw new Error('Password must contain at least one number');
      }

      if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
        throw new Error('Password must contain at least one special character');
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Verify current password by attempting to sign in
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: currentPassword,
      });

      if (verifyError) {
        throw new Error('Current password is incorrect');
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      // Get admin user for logging
      const { data: adminUser } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', user.email)
        .single();

      if (adminUser) {
        await this.logAuthEvent(adminUser.id, 'password_changed', {
          email: adminUser.email,
        });
      }
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  }

  /**
   * Check if session is still valid
   * Returns true if session exists and is not expired
   */
  async isSessionValid(): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return !!session;
    } catch (error) {
      console.error('Session validation error:', error);
      return false;
    }
  }

  /**
   * Refresh the current session
   * Extends session lifetime
   */
  async refreshSession(): Promise<void> {
    try {
      const { error } = await supabase.auth.refreshSession();
      if (error) throw error;
    } catch (error) {
      console.error('Session refresh error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
