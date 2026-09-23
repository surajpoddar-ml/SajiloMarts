import { useState } from 'react';
import { authService } from '../../services/auth.service.js';
import './Auth.css';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const ForgotPasswordPage = ({ onNavigateToLogin }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setApiError('');

    if (!email.trim()) {
      setError('Please enter your account email address');
      return;
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      setError('Please provide a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      await authService.forgotPassword(email.trim());
      setSubmitted(true);
    } catch (err) {
      setApiError(err.message || 'Unable to process recovery request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <span className="auth-badge">Account Recovery</span>
          <h2 className="auth-title">Forgot Password?</h2>
          <p className="auth-subtitle">We will send you a secure link to reset your password</p>
        </div>

        {apiError && <div className="auth-alert-error">{apiError}</div>}

        {submitted ? (
          <div>
            <div className="auth-alert-success" style={{ marginBottom: '1.5rem' }}>
              <strong>Recovery Email Dispatched</strong>
              <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem' }}>
                If an active account exists for <strong>{email}</strong>, a password reset link has been sent to your inbox.
              </p>
            </div>

            <p style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: 1.5, textAlign: 'center' }}>
              Please check your spam or junk folder if you don&apos;t see the email within a few minutes.
            </p>

            <button
              type="button"
              className="auth-submit-btn"
              onClick={onNavigateToLogin}
              style={{ marginTop: '1.5rem' }}
            >
              Return to Sign In
            </button>
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="forgot-email-input">Your Account Email</label>
              <input
                id="forgot-email-input"
                type="email"
                name="email"
                className={`form-input ${error ? 'input-error' : ''}`}
                placeholder="ramesh@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                  if (apiError) setApiError('');
                }}
                disabled={isSubmitting}
              />
              {error && <span className="error-text">{error}</span>}
            </div>

            <button
              id="forgot-submit-btn"
              type="submit"
              className="auth-submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending Link...' : 'Send Password Reset Link'}
            </button>
          </form>
        )}

        <div className="auth-footer">
          Remember your password?{' '}
          <button
            type="button"
            className="auth-link"
            onClick={onNavigateToLogin}
            style={{ background: 'none', border: 'none', padding: 0 }}
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
