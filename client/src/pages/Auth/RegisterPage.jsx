import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import './Auth.css';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PHONE_REGEX = /^(?:\+?(?:977|91)[\s-]?)?[6789]\d{9}$/;

export const RegisterPage = ({ onNavigateToLogin, onRegisterSuccess }) => {
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!EMAIL_REGEX.test(formData.email.trim())) {
      newErrors.email = 'Please provide a valid email address';
    }

    if (formData.phone && formData.phone.trim()) {
      const cleanedPhone = formData.phone.replace(/[\s-]/g, '');
      if (!PHONE_REGEX.test(cleanedPhone)) {
        newErrors.phone = 'Valid Nepal (+977) or India (+91) mobile format required';
      }
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
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
    setSuccessMessage(null);

    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone ? formData.phone.trim() : undefined,
        password: formData.password,
      });

      setSuccessMessage('Account created successfully! Redirecting...');
      if (onRegisterSuccess) {
        onRegisterSuccess();
      }
    } catch (err) {
      setApiError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <span className="auth-badge">Join SajiloMarts</span>
          <h2 className="auth-title">Create an Account</h2>
          <p className="auth-subtitle">Source products smoothly from India to Nepal</p>
        </div>

        {apiError && <div className="auth-alert-error">{apiError}</div>}
        {successMessage && <div className="auth-alert-success">{successMessage}</div>}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="register-name">Full Name</label>
            <input
              id="register-name"
              type="text"
              name="name"
              className={`form-input ${errors.name ? 'input-error' : ''}`}
              placeholder="e.g. Ramesh Thapa"
              value={formData.name}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-email">Email Address</label>
            <input
              id="register-email"
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
            <label className="form-label" htmlFor="register-phone">Phone Number (Optional)</label>
            <input
              id="register-phone"
              type="tel"
              name="phone"
              className={`form-input ${errors.phone ? 'input-error' : ''}`}
              placeholder="+977-9801234567"
              value={formData.phone}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            {errors.phone && <span className="error-text">{errors.phone}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-password">Password</label>
            <input
              id="register-password"
              type="password"
              name="password"
              className={`form-input ${errors.password ? 'input-error' : ''}`}
              placeholder="Min. 8 characters"
              value={formData.password}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-confirm-password">Confirm Password</label>
            <input
              id="register-confirm-password"
              type="password"
              name="confirmPassword"
              className={`form-input ${errors.confirmPassword ? 'input-error' : ''}`}
              placeholder="Re-enter your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
          </div>

          <button
            id="register-submit-btn"
            type="submit"
            className="auth-submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{' '}
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

export default RegisterPage;
