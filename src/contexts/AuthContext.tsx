import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { authService } from '../services/auth.service';
import { customersService } from '../services/customers.service';
import type { AuthContextType, AdminUser, Customer } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AdminUser | Customer | null>(null);
  const [userType, setUserType] = useState<'admin' | 'customer' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const checkInFlight = useRef(false);

  const checkAuth = useCallback(async () => {
    // Guard against overlapping runs (mount + onAuthStateChange + token
    // refresh can fire back-to-back).
    if (checkInFlight.current) return;
    checkInFlight.current = true;

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        setUser(null);
        setUserType(null);
        setError(null);
        return;
      }

      try {
        const adminUser = await authService.getCurrentUser();
        if (adminUser) {
          setUser(adminUser);
          setUserType('admin');
          setError(null);
          return;
        }
      } catch (adminError) {
        // Not an admin, continue to customer check
      }

      try {
        const customer = await customersService.getCustomerByAuthId(session.user.id);
        if (customer) {
          setUser(customer);
          setUserType('customer');
          setError(null);
        } else {
          // Session exists but no customer/admin row — treat as signed out
          setUser(null);
          setUserType(null);
        }
      } catch (customerError) {
        // Transient lookup failure: do NOT drop an existing session.
        console.error('Customer lookup failed:', customerError);
        setError('Failed to verify your session. Please try again.');
      }
    } catch (err) {
      console.error('Auth check error:', err);
      setError('Failed to verify authentication. Please try logging in again.');
      setUser(null);
      setUserType(null);
    } finally {
      checkInFlight.current = false;
      setIsLoading(false);
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setIsLoading(true);
        setError(null);
        await checkAuth();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserType(null);
        setError(null);
      } else if (event === 'TOKEN_REFRESHED') {
        setIsLoading(true);
        await checkAuth();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [checkAuth]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const adminUser = await authService.login(email, password);
      setUser(adminUser);
      setUserType('admin');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed. Please check your credentials.';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const customerLogin = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (!data.user) throw new Error('Login failed');

      await checkAuth();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed. Please check your credentials.';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const customerRegister = async (email: string, password: string, firstName?: string, lastName?: string, phone?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await customersService.registerCustomer({
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        phone,
      });
      await customerLogin(email, password);
    } catch (err) {
      const rawMessage =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : err instanceof Error
            ? err.message
            : '';
      const message = rawMessage || 'Registration failed. Please try again.';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.logout();
      setUser(null);
      setUserType(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Logout failed. Please try again.';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    userType,
    isAuthenticated: !!user,
    isLoading,
    isInitialized,
    error,
    login,
    customerLogin,
    customerRegister,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};