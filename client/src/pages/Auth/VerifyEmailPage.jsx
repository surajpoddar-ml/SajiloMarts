import { useState, useEffect } from 'react';
import { authService } from '../../services/auth.service.js';
import './Auth.css';

export const VerifyEmailPage = ({ initialToken, onNavigateToLogin, onNavigateToResend }) => {
  const [token, setToken] = useState(() => {
    if (initialToken) return initialToken;
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('token') || '';
    }
    return '';
  });

  const [status, setStatus] = useState('idle'); // 'idle' | 'verifying' | 'success' | 'error' | 'already_verified'
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleVerify = async (tokenToVerify) => {
    const raw = (tokenToVerify || token).trim();
    if (!raw) {
      setStatus('error');
      setErrorMessage('Please enter or provide a valid verification token');
      return;
    }

    setStatus('verifying');
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await authService.verifyEmail(raw);
      if (res?.data?.alreadyVerified) {
        setStatus('already_verified');
        setSuccessMessage('Your email address was already verified.');
      } else {
        setStatus('success');
        setSuccessMessage('Your email address has been successfully verified!');
      }
    } catch (err) {
      setStatus('error');
      setErrorMessage(err.message || 'Verification failed. The link may be invalid or expired.');
    }
  };

  useEffect(() => {
    if (token) {
      handleVerify(token);
    }
  }, []);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <span className="auth-badge">Account Security</span>
          <h2 className="auth-title">Email Verification</h2>
          <p className="auth-subtitle">Confirming your SastoMarts account</p>
        </div>

        {status === 'verifying' && (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ display: 'inline-block', width: '36px', height: '36px', border: '3px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <p style={{ marginTop: '1rem', color: '#64748b', fontSize: '0.95rem' }}>Verifying your security credentials...</p>
          </div>
        )}

        {(status === 'success' || status === 'already_verified') && (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div className="auth-alert-success" style={{ marginBottom: '1.5rem' }}>
              <strong>{status === 'already_verified' ? 'Already Verified' : 'Success!'}</strong>
              <div>{successMessage}</div>
            </div>
            <button
              type="button"
              className="auth-submit-btn"
              onClick={onNavigateToLogin}
            >
              Continue to Sign In
            </button>
          </div>
        )}

        {status === 'error' && (
          <div>
            <div className="auth-alert-error" style={{ marginBottom: '1.25rem' }}>
              <strong>Verification Error</strong>
              <div>{errorMessage}</div>
            </div>

            <form
              className="auth-form"
              onSubmit={(e) => {
                e.preventDefault();
                handleVerify(token);
              }}
            >
              <div className="form-group">
                <label className="form-label" htmlFor="verify-token-input">Paste Verification Token</label>
                <input
                  id="verify-token-input"
                  type="text"
                  className="form-input"
                  placeholder="e.g. a1b2c3d4..."
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                />
              </div>

              <button type="submit" className="auth-submit-btn">
                Retry Verification
              </button>
            </form>

            <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
              <button
                type="button"
                className="auth-link"
                onClick={onNavigateToResend}
                style={{ background: 'none', border: 'none', padding: 0 }}
              >
                Need a new verification link? Resend email
              </button>
            </div>
          </div>
        )}

        {status === 'idle' && !token && (
          <form
            className="auth-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleVerify(token);
            }}
          >
            <div className="form-group">
              <label className="form-label" htmlFor="verify-token-input-manual">Enter Verification Token</label>
              <input
                id="verify-token-input-manual"
                type="text"
                className="form-input"
                placeholder="Enter 64-character token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
              />
            </div>

            <button type="submit" className="auth-submit-btn">
              Verify Account
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

export default VerifyEmailPage;
