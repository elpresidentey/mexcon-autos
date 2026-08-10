# Authentication Service Documentation

## Overview

The `AuthService` provides comprehensive authentication and session management for the Mexcon Autos admin platform. It implements security best practices including account lockout, password validation, audit logging, and secure token management.

## Features

### 🔐 Core Authentication
- Email and password login
- Secure logout with token invalidation
- Session persistence across page reloads
- Automatic token refresh (24-hour sessions)

### 🛡️ Security Features
- **Account Lockout**: Locks account after 3 failed login attempts for 15 minutes
- **Password Validation**: Enforces strong password requirements
- **Audit Logging**: Tracks all authentication events
- **Session Timeout**: Automatic logout after 24 hours of inactivity
- **Secure Token Storage**: Uses localStorage with httpOnly-like behavior through Supabase

### 📝 Profile Management
- Update user profile (name, email)
- Change password with current password verification
- Password strength validation

## Usage

### Import

```typescript
import { authService } from '@/services/auth.service';
```

### Login

```typescript
try {
  const adminUser = await authService.login('admin@example.com', 'password123');
  console.log('Logged in:', adminUser);
} catch (error) {
  console.error('Login failed:', error.message);
  // Error messages:
  // - "Email and password are required"
  // - "Invalid email or password"
  // - "Account is locked due to multiple failed login attempts. Please try again in X minute(s)."
  // - "Admin user not found"
}
```

### Logout

```typescript
try {
  await authService.logout();
  console.log('Logged out successfully');
} catch (error) {
  console.error('Logout failed:', error);
}
```

### Get Current User

```typescript
const currentUser = await authService.getCurrentUser();
if (currentUser) {
  console.log('Current user:', currentUser);
} else {
  console.log('No user logged in');
}
```

### Change Password

```typescript
try {
  await authService.changePassword('currentPassword123!', 'NewPassword456!');
  console.log('Password changed successfully');
} catch (error) {
  console.error('Password change failed:', error.message);
  // Error messages:
  // - "Current password and new password are required"
  // - "Password must be at least 8 characters long"
  // - "Password must contain at least one uppercase letter"
  // - "Password must contain at least one lowercase letter"
  // - "Password must contain at least one number"
  // - "Password must contain at least one special character"
  // - "Current password is incorrect"
}
```

### Update Profile

```typescript
try {
  const updatedUser = await authService.updateProfile({
    name: 'New Name',
    email: 'newemail@example.com',
  });
  console.log('Profile updated:', updatedUser);
} catch (error) {
  console.error('Profile update failed:', error);
}
```

### Check Session Validity

```typescript
const isValid = await authService.isSessionValid();
console.log('Session valid:', isValid);
```

### Refresh Session

```typescript
try {
  await authService.refreshSession();
  console.log('Session refreshed');
} catch (error) {
  console.error('Session refresh failed:', error);
}
```

## Security Implementation

### Account Lockout

The service tracks failed login attempts in memory:
- **Threshold**: 3 failed attempts
- **Lockout Duration**: 15 minutes
- **Reset**: Counter resets after 15 minutes of no attempts or successful login

### Password Requirements

Passwords must meet the following criteria:
- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one special character (!@#$%^&*(),.?":{}|<>)

### Session Management

- **Storage**: localStorage via Supabase client
- **Persistence**: Sessions persist across browser restarts
- **Auto-refresh**: Tokens automatically refresh before expiration
- **Timeout**: Sessions expire after 24 hours of inactivity
- **Security**: PKCE flow for enhanced security

### Audit Logging

All authentication events are logged to the `audit_logs` table:
- Login success
- Login failure
- Account lockout
- Logout
- Password change
- Profile update

## Integration with AuthContext

The `AuthService` is used by the `AuthContext` to provide authentication state throughout the application:

```typescript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please log in</div>;

  return <div>Welcome, {user.name}!</div>;
}
```

## Database Requirements

The service requires the following database tables:

### admin_users
```sql
CREATE TABLE admin_users (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role admin_role DEFAULT 'enquiry_manager',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);
```

### audit_logs
```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY,
    admin_user_id UUID REFERENCES admin_users(id),
    action_type VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID,
    previous_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Environment Configuration

Required environment variables in `.env`:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Supabase Configuration

The service uses Supabase Auth with the following configuration:

```typescript
{
  auth: {
    persistSession: true,          // Enable session persistence
    autoRefreshToken: true,        // Auto-refresh tokens
    detectSessionInUrl: true,      // Detect sessions from URL
    storage: window.localStorage,  // Use localStorage
    storageKey: 'mexcon-auth-token', // Custom storage key
    flowType: 'pkce',              // Use PKCE flow
  }
}
```

## Error Handling

All methods throw errors that should be caught and handled:

```typescript
try {
  await authService.login(email, password);
} catch (error) {
  if (error.message.includes('locked')) {
    // Handle account lockout
  } else if (error.message.includes('Invalid')) {
    // Handle invalid credentials
  } else {
    // Handle other errors
  }
}
```

## Best Practices

1. **Always validate input** before calling auth methods
2. **Handle all errors** appropriately in your UI
3. **Don't store passwords** in state or logs
4. **Use the AuthContext** for global auth state
5. **Check session validity** before sensitive operations
6. **Refresh sessions** periodically for long-running apps
7. **Log out users** when they close the browser (if required)
8. **Display clear error messages** to users

## Testing

The service includes comprehensive unit tests. Run them with:

```bash
npm test src/services/auth.service.test.ts
```

## Future Enhancements

Potential improvements:
- Multi-factor authentication (MFA)
- Biometric authentication support
- IP-based access restrictions
- Session management dashboard
- Password reset via email
- Remember me functionality
- Social login integration

## Support

For issues or questions:
1. Check the error message for specific guidance
2. Verify environment variables are set correctly
3. Ensure Supabase project is properly configured
4. Check browser console for detailed error logs
5. Review audit logs for authentication events

## License

Internal use only - Mexcon Autos Platform
