import { useState } from 'react';
import { authService } from '../../services/auth.service.js';
import './Auth.css';

export const ResetPasswordPage = ({ initialToken, onNavigateToLogin, onNavigateToForgot }) => {
  const [token, setToken] = useState(() => {
    if (initialToken) return initialToken;
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('token') || '';
    }
    return '';
  });

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validate = () => {
    const newErrors = {};

    if (!token.trim()) {
      newErrors.token = 'A valid reset token is required';
    }

    if (!formData.password) {
      newErrors.password = 'New password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    } else if (formData.password.length > 128) {
      newErrors.password = 'Password cannot exceed 128 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
    if (apiError) setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setApiError('');

    try {
      await authService.resetPassword({
        token: token.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });
      setIsSuccess(true);
    } catch (err) {
      setApiError(err.message || 'Password reset failed. The link may have expired or already been used.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <span className="auth-badge">Account Security</span>
          <h2 className="auth-title">Set New Password</h2>
          <p className="auth-subtitle">Create a secure password for your account</p>
        </div>

        {apiError && <div className="auth-alert-error">{apiError}</div>}

        {isSuccess ? (
          <div>
            <div className="auth-alert-success" style={{ marginBottom: '1.5rem' }}>
              <strong>Password Reset Successful!</strong>
              <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem' }}>
                Your password has been securely updated. You can now sign in with your new credentials.
              </p>
            </div>

            <button
              type="button"
              className="auth-submit-btn"
              onClick={onNavigateToLogin}
            >
              Proceed to Sign In
            </button>
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {!token && (
              <div className="form-group">
                <label className="form-label" htmlFor="reset-token-input">Recovery Token</label>
                <input
                  id="reset-token-input"
                  type="text"
                  name="token"
                  className={`form-input ${errors.token ? 'input-error' : ''}`}
                  placeholder="Paste token from email link"
                  value={token}
                  onChange={(e) => {
                    setToken(e.target.value);
                    if (errors.token) setErrors((prev) => ({ ...prev, token: null }));
                  }}
                  disabled={isSubmitting}
                />
                {errors.token && <span className="error-text">{errors.token}</span>}
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="reset-new-password">New Password</label>
              <input
                id="reset-new-password"
                type="password"
                name="password"
                className={`form-input ${errors.password ? 'input-error' : ''}`}
                placeholder="Minimum 8 characters"
                value={formData.password}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reset-confirm-password">Confirm New Password</label>
              <input
                id="reset-confirm-password"
                type="password"
                name="confirmPassword"
                className={`form-input ${errors.confirmPassword ? 'input-error' : ''}`}
                placeholder="Re-enter new password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
            </div>

            <button
              id="reset-submit-btn"
              type="submit"
              className="auth-submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating Password...' : 'Save New Password'}
            </button>
          </form>
        )}

        <div className="auth-footer">
          <button
            type="button"
            className="auth-link"
            onClick={onNavigateToLogin}
            style={{ background: 'none', border: 'none', padding: 0 }}
          >
            &larr; Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
