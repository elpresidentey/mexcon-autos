import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { isAdminUser } from '../../types';
import { Button, Input, Card } from '../../components/common';
import { validateEmail } from '../../utils/validation';
import toast from 'react-hot-toast';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, login } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });
  
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if an admin is already signed in (must run during render via
  // <Navigate>, not navigate(), to avoid updating the router mid-render)
  if (isAuthenticated && isAdminUser(user)) {
    return <Navigate to="/admin" replace />;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors = {
      email: '',
      password: '',
    };

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return !newErrors.email && !newErrors.password;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsLoading(true);

    try {
      await login(formData.email, formData.password);
      toast.success('Login successful!');
      navigate('/admin');
    } catch (error) {
      console.error('Login error:', error);
      const message = error instanceof Error ? error.message : '';
      
      if (
        message.includes('Invalid email or password') ||
        message.includes('Invalid login credentials') ||
        message.includes('Email not confirmed')
      ) {
        toast.error('Invalid email or password');
      } else if (message.includes('Admin user not found')) {
        toast.error('You do not have admin access');
      } else if (message.includes('locked')) {
        toast.error(message);
      } else {
        toast.error('Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-2xl">M</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-secondary-900">
            Admin Login
          </h1>
          <p className="mt-2 text-secondary-600">
            Sign in to access the dashboard
          </p>
        </div>

        {/* Login Form */}
        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              id="email"
              name="email"
              type="email"
              label="Email Address"
              placeholder="admin@mexconautos.com"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              required
              autoComplete="email"
              autoFocus
            />

            <Input
              id="password"
              name="password"
              type="password"
              label="Password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              required
              autoComplete="current-password"
            />

            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Additional Links */}
          <div className="mt-6 space-y-3 text-center">
            <Link to="/forgot-password" className="block text-sm text-primary-600 hover:text-primary-700 transition-colors">
              Forgot password?
            </Link>
            <a
              href="/"
              className="block text-sm text-primary-600 hover:text-primary-700 transition-colors"
            >
              ← Back to website
            </a>
          </div>
        </Card>

        {/* Footer Note */}
        <p className="mt-8 text-center text-sm text-secondary-600">
          Mexcon Autos Admin Dashboard
        </p>
      </div>
    </div>
  );
};
