import { useState } from 'react';
import { authService } from '../../services/auth.service.js';
import '../Auth/Auth.css';

export const ChangePasswordSection = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'New password must be at least 8 characters long';
    } else if (formData.newPassword.length > 128) {
      newErrors.newPassword = 'Password cannot exceed 128 characters';
    }

    if (formData.currentPassword && formData.newPassword && formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'New password cannot be the same as your current password';
    }

    if (formData.newPassword !== formData.confirmPassword) {
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
    if (successMessage) setSuccessMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setApiError('');
    setSuccessMessage('');

    try {
      await authService.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });

      setSuccessMessage('Your password has been changed successfully.');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      setApiError(err.message || 'Failed to change password. Please check your current password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ marginTop: '2rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
      <h3 style={{ margin: '0 0 0.5rem', color: '#0f172a', fontSize: '1.2rem' }}>Account Security</h3>
      <p style={{ margin: '0 0 1.25rem', color: '#64748b', fontSize: '0.9rem' }}>
        Change your login password to keep your SastoMarts account secure.
      </p>

      {apiError && <div className="auth-alert-error" style={{ marginBottom: '1rem' }}>{apiError}</div>}
      {successMessage && <div className="auth-alert-success" style={{ marginBottom: '1rem' }}>{successMessage}</div>}

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label className="form-label" htmlFor="change-current-password">Current Password</label>
          <input
            id="change-current-password"
            type="password"
            name="currentPassword"
            className={`form-input ${errors.currentPassword ? 'input-error' : ''}`}
            placeholder="Enter your current password"
            value={formData.currentPassword}
            onChange={handleChange}
            disabled={isSubmitting}
          />
          {errors.currentPassword && <span className="error-text">{errors.currentPassword}</span>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="change-new-password">New Password</label>
          <input
            id="change-new-password"
            type="password"
            name="newPassword"
            className={`form-input ${errors.newPassword ? 'input-error' : ''}`}
            placeholder="Enter new password (min. 8 characters)"
            value={formData.newPassword}
            onChange={handleChange}
            disabled={isSubmitting}
          />
          {errors.newPassword && <span className="error-text">{errors.newPassword}</span>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="change-confirm-password">Confirm New Password</label>
          <input
            id="change-confirm-password"
            type="password"
            name="confirmPassword"
            className={`form-input ${errors.confirmPassword ? 'input-error' : ''}`}
            placeholder="Confirm new password"
            value={formData.confirmPassword}
            onChange={handleChange}
            disabled={isSubmitting}
          />
          {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
        </div>

        <button
          id="change-password-submit-btn"
          type="submit"
          className="auth-submit-btn"
          style={{ maxWidth: '220px' }}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
};

export default ChangePasswordSection;
