import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Seo } from '../../components/Seo';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { customerRegister } = useAuth();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    try {
      await customerRegister(form.email, form.password, form.firstName, form.lastName, form.phone || undefined);
      navigate('/account');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Seo
        title="Create Account"
        description="Create your free Mexcon Autos account to check out faster and track your orders."
        canonicalPath="/register"
      />
      <div className="container-custom py-20">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-accent-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="font-display text-black font-extrabold text-2xl leading-none">M</span>
            </div>
            <h1 className="font-display text-4xl font-extrabold text-dark-900 uppercase tracking-wide">Create your account</h1>
            <p className="text-metallic-600 mt-2">Register to buy parts and track your orders</p>
          </div>

          <div className="card p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-medium rounded-xl px-4 py-3">
                  {error}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label" htmlFor="reg-first">
                    First Name
                  </label>
                  <input
                    id="reg-first"
                    type="text"
                    value={form.firstName}
                    onChange={handleChange('firstName')}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="label" htmlFor="reg-last">
                    Last Name
                  </label>
                  <input
                    id="reg-last"
                    type="text"
                    value={form.lastName}
                    onChange={handleChange('lastName')}
                    className="input"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="label" htmlFor="reg-email">
                  Email
                </label>
                <input
                  id="reg-email"
                  type="email"
                  value={form.email}
                  onChange={handleChange('email')}
                  className="input"
                  required
                  autoComplete="email"
                />
              </div>
              <div>
                <label className="label" htmlFor="reg-phone">
                  Phone <span className="text-metallic-500 font-normal">(optional)</span>
                </label>
                <input
                  id="reg-phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange('phone')}
                  className="input"
                  autoComplete="tel"
                />
              </div>
              <div>
                <label className="label" htmlFor="reg-password">
                  Password
                </label>
                <input
                  id="reg-password"
                  type="password"
                  value={form.password}
                  onChange={handleChange('password')}
                  className="input"
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>
              <div>
                <label className="label" htmlFor="reg-confirm">
                  Confirm Password
                </label>
                <input
                  id="reg-confirm"
                  type="password"
                  value={form.confirmPassword}
                  onChange={handleChange('confirmPassword')}
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
                {isSubmitting ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-metallic-200 text-center">
              <p className="text-sm text-metallic-600">
                Already have an account?{' '}
                <Link to="/login" className="font-bold text-primary-600 hover:text-primary-700">
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;