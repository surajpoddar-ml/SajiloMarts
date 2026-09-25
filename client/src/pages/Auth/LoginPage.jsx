import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import './Auth.css';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const LoginPage = ({
  onNavigateToRegister,
  onNavigateToForgot,
  onNavigateToResend,
  onLoginSuccess,
}) => {
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!EMAIL_REGEX.test(formData.email.trim())) {
      newErrors.email = 'Please provide a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
    if (apiError) setApiError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setApiError(null);

    try {
      await login({
        email: formData.email.trim(),
        password: formData.password,
      });

      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (err) {
      setApiError(err.message || 'Invalid email or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <span className="auth-badge">Secure Access</span>
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Sign in to your SajiloMarts account</p>
        </div>

        {apiError && <div className="auth-alert-error">{apiError}</div>}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              type="email"
              name="email"
              className={`form-input ${errors.email ? 'input-error' : ''}`}
              placeholder="ramesh@example.com"
              value={formData.email}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label" htmlFor="login-password">Password</label>
              {onNavigateToForgot && (
                <button
                  type="button"
                  className="auth-link"
                  onClick={onNavigateToForgot}
                  style={{ background: 'none', border: 'none', padding: 0, fontSize: '0.8rem' }}
                >
                  Forgot password?
                </button>
              )}
            </div>
            <input
              id="login-password"
              type="password"
              name="password"
              className={`form-input ${errors.password ? 'input-error' : ''}`}
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            className="auth-submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div>
            Don&apos;t have an account?{' '}
            <button
              type="button"
              className="auth-link"
              onClick={onNavigateToRegister}
              style={{ background: 'none', border: 'none', padding: 0 }}
            >
              Create Account
            </button>
          </div>
          {onNavigateToResend && (
            <div>
              <button
                type="button"
                className="auth-link"
                onClick={onNavigateToResend}
                style={{ background: 'none', border: 'none', padding: 0, fontSize: '0.825rem', color: '#64748b' }}
              >
                Need to verify your email? Resend link
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
