import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthService } from './auth.service';
import { supabase } from './supabase';

// Mock Supabase client
vi.mock('./supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
      getUser: vi.fn(),
      updateUser: vi.fn(),
      refreshSession: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
    })),
  },
}));

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      const mockUser = { id: 'user-1', email: 'admin@test.com' };
      const mockAdminUser = {
        id: 'admin-1',
        name: 'Admin User',
        email: 'admin@test.com',
        role: 'super_admin',
        created_at: '2024-01-01',
      };

      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: mockUser as any, session: {} as any },
        error: null,
      });

      const fromMock = vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockAdminUser, error: null }),
        update: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
      }));

      vi.mocked(supabase.from).mockImplementation(fromMock as any);

      const result = await authService.login('admin@test.com', 'password123');

      expect(result).toEqual(mockAdminUser);
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'admin@test.com',
        password: 'password123',
      });
    });

    it('should throw error with invalid credentials', async () => {
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid credentials' } as any,
      });

      await expect(
        authService.login('admin@test.com', 'wrongpassword')
      ).rejects.toThrow('Invalid email or password');
    });

    it('should lock account after 3 failed attempts', async () => {
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid credentials' } as any,
      });

      // Attempt 1
      await expect(
        authService.login('admin@test.com', 'wrong1')
      ).rejects.toThrow('Invalid email or password');

      // Attempt 2
      await expect(
        authService.login('admin@test.com', 'wrong2')
      ).rejects.toThrow('Invalid email or password');

      // Attempt 3 should show lockout message (not invalid credentials)
      await expect(
        authService.login('admin@test.com', 'wrong3')
      ).rejects.toThrow(/Too many failed login attempts/);

      // Attempt 4 should be locked
      await expect(
        authService.login('admin@test.com', 'wrong4')
      ).rejects.toThrow(/Account is locked due to multiple failed login attempts/);
    });

    it('should require email and password', async () => {
      await expect(authService.login('', 'password')).rejects.toThrow(
        'Email and password are required'
      );

      await expect(authService.login('email@test.com', '')).rejects.toThrow(
        'Email and password are required'
      );
    });
  });

  describe('logout', () => {
    it('should successfully logout', async () => {
      vi.mocked(supabase.auth.signOut).mockResolvedValue({
        error: null,
      });

      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      await expect(authService.logout()).resolves.not.toThrow();
      expect(supabase.auth.signOut).toHaveBeenCalled();
    });

    it('should throw error if logout fails', async () => {
      vi.mocked(supabase.auth.signOut).mockResolvedValue({
        error: { message: 'Logout failed' } as any,
      });

      await expect(authService.logout()).rejects.toThrow();
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user when session exists', async () => {
      const mockSession = {
        user: { id: 'user-1', email: 'admin@test.com' },
      };

      const mockAdminUser = {
        id: 'admin-1',
        name: 'Admin User',
        email: 'admin@test.com',
        role: 'super_admin',
        created_at: '2024-01-01',
      };

      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: mockSession as any },
        error: null,
      });

      const fromMock = vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockAdminUser, error: null }),
      }));

      vi.mocked(supabase.from).mockImplementation(fromMock as any);

      const result = await authService.getCurrentUser();

      expect(result).toEqual(mockAdminUser);
    });

    it('should return null when no session exists', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const result = await authService.getCurrentUser();

      expect(result).toBeNull();
    });
  });

  describe('changePassword', () => {
    it('should successfully change password with valid requirements', async () => {
      const mockUser = { id: 'user-1', email: 'admin@test.com' };

      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser as any },
        error: null,
      });

      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: mockUser as any, session: {} as any },
        error: null,
      });

      vi.mocked(supabase.auth.updateUser).mockResolvedValue({
        data: { user: mockUser as any },
        error: null,
      });

      await expect(
        authService.changePassword('oldPassword123!', 'NewPassword123!')
      ).resolves.not.toThrow();

      expect(supabase.auth.updateUser).toHaveBeenCalledWith({
        password: 'NewPassword123!',
      });
    });

    it('should reject weak passwords', async () => {
      await expect(
        authService.changePassword('current', 'short')
      ).rejects.toThrow('Password must be at least 8 characters long');

      await expect(
        authService.changePassword('current', 'nouppercase1!')
      ).rejects.toThrow('Password must contain at least one uppercase letter');

      await expect(
        authService.changePassword('current', 'NOLOWERCASE1!')
      ).rejects.toThrow('Password must contain at least one lowercase letter');

      await expect(
        authService.changePassword('current', 'NoNumbers!')
      ).rejects.toThrow('Password must contain at least one number');

      await expect(
        authService.changePassword('current', 'NoSpecial123')
      ).rejects.toThrow('Password must contain at least one special character');
    });

    it('should verify current password before changing', async () => {
      const mockUser = { id: 'user-1', email: 'admin@test.com' };

      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser as any },
        error: null,
      });

      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid credentials' } as any,
      });

      await expect(
        authService.changePassword('wrongCurrent', 'NewPassword123!')
      ).rejects.toThrow('Current password is incorrect');
    });
  });

  describe('updateProfile', () => {
    it('should update user profile successfully', async () => {
      const mockUser = { id: 'user-1', email: 'admin@test.com' };
      const mockAdminUser = {
        id: 'admin-1',
        name: 'Admin User',
        email: 'admin@test.com',
        role: 'super_admin',
        created_at: '2024-01-01',
      };

      const updatedAdminUser = {
        ...mockAdminUser,
        name: 'Updated Name',
      };

      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser as any },
        error: null,
      });

      const singleMock = vi.fn()
        .mockResolvedValueOnce({ data: mockAdminUser, error: null })
        .mockResolvedValue({ data: updatedAdminUser, error: null });

      vi.mocked(supabase.from).mockImplementation((table: string) => {
        if (table === 'admin_users') {
          return {
            select: vi.fn().mockReturnThis(),
            update: vi.fn().mockReturnThis(),
            insert: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: singleMock,
          } as any;
        }
        if (table === 'audit_logs') {
          return {
            insert: vi.fn().mockImplementation(() => ({
              then: (callback: any) => Promise.resolve(callback()),
            })),
          } as any;
        }
        return {
          select: vi.fn().mockReturnThis(),
          insert: vi.fn().mockReturnThis(),
          update: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        } as any;
      });

      const result = await authService.updateProfile({ name: 'Updated Name' });

      expect(result.name).toBe('Updated Name');
    });
  });

  describe('isSessionValid', () => {
    it('should return true when session exists', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: { user: {} } as any },
        error: null,
      });

      const result = await authService.isSessionValid();

      expect(result).toBe(true);
    });

    it('should return false when no session exists', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const result = await authService.isSessionValid();

      expect(result).toBe(false);
    });
  });

  describe('refreshSession', () => {
    it('should refresh session successfully', async () => {
      vi.mocked(supabase.auth.refreshSession).mockResolvedValue({
        data: { session: {} as any, user: {} as any },
        error: null,
      });

      await expect(authService.refreshSession()).resolves.not.toThrow();
      expect(supabase.auth.refreshSession).toHaveBeenCalled();
    });

    it('should throw error if refresh fails', async () => {
      vi.mocked(supabase.auth.refreshSession).mockResolvedValue({
        data: { session: null, user: null },
        error: { message: 'Refresh failed' } as any,
      });

      await expect(authService.refreshSession()).rejects.toThrow();
    });
  });
});
