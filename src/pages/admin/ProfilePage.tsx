import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { isAdminUser } from '../../types';
import { authService } from '../../services/auth.service';
import {
  Button,
  Card,
  Input,
  LoadingSpinner,
  Badge,
} from '../../components/common';
import { 
  UserIcon, 
  KeyIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export const ProfilePage = () => {
  const { user } = useAuth();
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isAdminUser(user)) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field
    if (profileErrors[name]) {
      setProfileErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field
    if (passwordErrors[name]) {
      setPasswordErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateProfile = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!profileData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!profileData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      newErrors.email = 'Invalid email address';
    }

    setProfileErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else {
      // Password strength validation
      if (passwordData.newPassword.length < 8) {
        newErrors.newPassword = 'Password must be at least 8 characters long';
      } else if (!/[A-Z]/.test(passwordData.newPassword)) {
        newErrors.newPassword = 'Password must contain at least one uppercase letter';
      } else if (!/[a-z]/.test(passwordData.newPassword)) {
        newErrors.newPassword = 'Password must contain at least one lowercase letter';
      } else if (!/[0-9]/.test(passwordData.newPassword)) {
        newErrors.newPassword = 'Password must contain at least one number';
      } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(passwordData.newPassword)) {
        newErrors.newPassword = 'Password must contain at least one special character';
      }
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateProfile()) {
      toast.error('Please fix the errors before saving');
      return;
    }

    setIsSavingProfile(true);

    try {
      await authService.updateProfile(profileData);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePassword()) {
      toast.error('Please fix the errors before changing password');
      return;
    }

    setIsChangingPassword(true);

    try {
      await authService.changePassword(passwordData.currentPassword, passwordData.newPassword);
      toast.success('Password changed successfully');
      
      // Clear password form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast.error(error.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'primary';
      case 'content_manager':
        return 'success';
      case 'enquiry_manager':
        return 'info';
      default:
        return 'secondary';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'Super Admin';
      case 'content_manager':
        return 'Content Manager';
      case 'enquiry_manager':
        return 'Enquiry Manager';
      default:
        return role;
    }
  };

  if (!isAdminUser(user)) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl lg:text-4xl font-extrabold uppercase tracking-wide text-ink">My Profile</h1>
        <p className="text-metallic-600 mt-1">Manage your account information and security</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Info Card */}
        <Card className="p-6 lg:col-span-1">
          <div className="text-center">
            <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-4">
              <UserIcon className="w-12 h-12 text-primary-600" />
            </div>
            <h3 className="font-display text-xl font-bold uppercase tracking-wide text-ink">{user.name}</h3>
            <p className="text-sm text-metallic-500 mt-1">{user.email}</p>
            <div className="mt-4">
              <Badge variant={getRoleBadgeVariant(user.role)}>
                {getRoleLabel(user.role)}
              </Badge>
            </div>
            {user.last_login && (
              <p className="text-xs text-metallic-400 mt-4">
                Last login: {new Date(user.last_login).toLocaleString()}
              </p>
            )}
          </div>
        </Card>

        {/* Profile Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <UserIcon className="w-6 h-6 text-primary-600" />
              <h2 className="font-display text-xl font-bold uppercase tracking-wide text-ink">Personal Information</h2>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <Input
                label="Full Name"
                name="name"
                value={profileData.name}
                onChange={handleProfileChange}
                error={profileErrors.name}
                required
                placeholder="John Doe"
              />

              <Input
                label="Email Address"
                name="email"
                type="email"
                value={profileData.email}
                onChange={handleProfileChange}
                error={profileErrors.email}
                required
                placeholder="admin@mexconautos.com"
              />

              <div className="flex items-center justify-end pt-4">
                <Button type="submit" isLoading={isSavingProfile} disabled={isSavingProfile}>
                  {isSavingProfile ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </Card>

          {/* Change Password */}
          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <KeyIcon className="w-6 h-6 text-primary-600" />
              <h2 className="font-display text-xl font-bold uppercase tracking-wide text-ink">Change Password</h2>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <Input
                label="Current Password"
                name="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                error={passwordErrors.currentPassword}
                required
                placeholder="Enter your current password"
              />

              <Input
                label="New Password"
                name="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                error={passwordErrors.newPassword}
                required
                placeholder="Enter your new password"
                helperText="Must be at least 8 characters with uppercase, lowercase, number, and special character"
              />

              <Input
                label="Confirm New Password"
                name="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                error={passwordErrors.confirmPassword}
                required
                placeholder="Confirm your new password"
              />

              <div className="flex items-center justify-end pt-4">
                <Button type="submit" isLoading={isChangingPassword} disabled={isChangingPassword}>
                  {isChangingPassword ? 'Changing...' : 'Change Password'}
                </Button>
              </div>
            </form>
          </Card>

          {/* Security Info */}
          <Card className="p-6 bg-primary-50 border-primary-200">
            <div className="flex items-start space-x-3">
              <ShieldCheckIcon className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-ink mb-2">Password Requirements</h3>
                <ul className="text-sm text-metallic-600 space-y-1">
                  <li>• At least 8 characters long</li>
                  <li>• Contains uppercase letters (A-Z)</li>
                  <li>• Contains lowercase letters (a-z)</li>
                  <li>• Contains numbers (0-9)</li>
                  <li>• Contains special characters (!@#$%^&*)</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
