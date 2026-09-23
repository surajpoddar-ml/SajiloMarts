import { useState, useEffect } from 'react';
import { authService } from '../../services/auth.service.js';
import './Auth.css';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const ResendVerificationPage = ({ onNavigateToLogin }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  useEffect(() => {
    let timer;
    if (cooldownSeconds > 0) {
      timer = setTimeout(() => {
        setCooldownSeconds((prev) => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldownSeconds]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setApiError('');

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      setError('Please provide a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      await authService.resendVerification(email.trim());
      setSubmitted(true);
      setCooldownSeconds(60); // 60s cooldown timer
    } catch (err) {
      setApiError(err.message || 'Unable to process request at this time. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <span className="auth-badge">Account Security</span>
          <h2 className="auth-title">Resend Verification</h2>
          <p className="auth-subtitle">Request a new email verification link</p>
        </div>

        {apiError && <div className="auth-alert-error">{apiError}</div>}

        {submitted ? (
          <div>
            <div className="auth-alert-success" style={{ marginBottom: '1.5rem' }}>
              <strong>Verification Request Sent</strong>
              <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem' }}>
                If an unverified account is registered under <strong>{email}</strong>, a new verification link has been dispatched. Please check your inbox and spam folder.
              </p>
            </div>

            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              {cooldownSeconds > 0 ? (
                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
                  You can request another link in <strong>{cooldownSeconds}s</strong>
                </p>
              ) : (
                <button
                  type="button"
                  className="auth-link"
                  onClick={() => setSubmitted(false)}
                  style={{ background: 'none', border: 'none', padding: 0 }}
                >
                  Resend to another email address
                </button>
              )}
            </div>
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="resend-email-input">Registered Email Address</label>
              <input
                id="resend-email-input"
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
                disabled={isSubmitting || cooldownSeconds > 0}
              />
              {error && <span className="error-text">{error}</span>}
            </div>

            <button
              id="resend-submit-btn"
              type="submit"
              className="auth-submit-btn"
              disabled={isSubmitting || cooldownSeconds > 0}
            >
              {isSubmitting
                ? 'Sending Request...'
                : cooldownSeconds > 0
                ? `Wait ${cooldownSeconds}s`
                : 'Send Verification Email'}
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

export default ResendVerificationPage;
