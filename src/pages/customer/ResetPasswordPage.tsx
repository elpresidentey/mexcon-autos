import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Seo } from '../../components/Seo';

export const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const [sessionActive, setSessionActive] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // The recovery link arrives as a hash fragment (access token / PKCE code)
    // which the Supabase client exchanges on startup. By the time this page
    // mounts, the resulting recovery session is in place.
    let cancelled = false;
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (cancelled) return;
        setSessionActive(!!data.session);
      })
      .catch(() => {
        if (!cancelled) setSessionActive(false);
      })
      .finally(() => {
        if (!cancelled) setIsChecking(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword(password);
      navigate('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Seo
        title="Reset Password"
        description="Set a new password for your Mexcon Autos account."
        canonicalPath="/reset-password"
      />
      <div className="container-custom py-20">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-accent-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="font-display text-black font-extrabold text-2xl leading-none">M</span>
            </div>
            <h1 className="font-display text-4xl font-extrabold text-dark-900 uppercase tracking-wide">
              Set a new password
            </h1>
            <p className="text-metallic-600 mt-2">Choose a strong password you haven&apos;t used before.</p>
          </div>

          <div className="bg-white rounded-2xl ring-1 ring-black/5 shadow-sm p-8">
            {isChecking ? (
              <div className="text-center py-6">
                <div className="spinner w-6 h-6 mx-auto" />
                <p className="text-sm text-metallic-600 mt-3">Checking your reset link...</p>
              </div>
            ) : !sessionActive ? (
              <div className="text-center">
                <p className="text-sm text-metallic-600 mb-6">
                  This reset link is invalid or has expired. Request a new one and make sure you open it in the
                  same browser you requested it with.
                </p>
                <Link to="/forgot-password" className="btn btn-primary btn-lg w-full">
                  Request a New Link
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-medium rounded-xl px-4 py-3">
                    {error}
                  </div>
                )}
                <div>
                  <label className="label" htmlFor="reset-password">
                    New Password
                  </label>
                  <input
                    id="reset-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    placeholder="At least 6 characters"
                  />
                </div>
                <div>
                  <label className="label" htmlFor="reset-confirm">
                    Confirm New Password
                  </label>
                  <input
                    id="reset-confirm"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input"
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary btn-lg w-full"
                >
                  {isSubmitting ? 'Saving...' : 'Save New Password'}
                </button>
              </form>
            )}

            <div className="mt-6 pt-6 border-t border-metallic-200 text-center">
              <p className="text-sm text-metallic-600">
                Remembered it?{' '}
                <Link to="/login" className="font-bold text-primary-600 hover:text-primary-700">
                  Back to Login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;