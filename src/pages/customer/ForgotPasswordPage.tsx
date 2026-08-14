import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Seo } from '../../components/Seo';
import { validateEmail } from '../../utils/validation';

export const ForgotPasswordPage = () => {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Seo
        title="Forgot Password"
        description="Reset your Mexcon Autos account password."
        canonicalPath="/forgot-password"
      />
      <div className="container-custom py-20">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-accent-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="font-display text-black font-extrabold text-2xl leading-none">M</span>
            </div>
            <h1 className="font-display text-4xl font-extrabold text-dark-900 uppercase tracking-wide">
              {sent ? 'Check your email' : 'Forgot your password?'}
            </h1>
            <p className="text-metallic-600 mt-2">
              {sent
                ? `We sent a password reset link to ${email}. It may take a few minutes to arrive.`
                : 'Enter your email and we will send you a reset link.'}
            </p>
          </div>

          <div className="bg-white rounded-2xl ring-1 ring-black/5 shadow-sm p-8">
            {sent ? (
              <div className="text-center">
                <p className="text-sm text-metallic-600 mb-6">
                  Didn&apos;t get the email? Check your spam folder or try again.
                </p>
                <Link to="/login" className="btn btn-primary btn-lg w-full">
                  Back to Login
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
                  <label className="label" htmlFor="forgot-email">
                    Email
                  </label>
                  <input
                    id="forgot-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input"
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary btn-lg w-full"
                >
                  {isSubmitting ? 'Sending...' : 'Send Reset Link'}
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

export default ForgotPasswordPage;