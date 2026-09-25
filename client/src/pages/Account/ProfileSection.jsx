import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody } from '../../components/common/Card.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Typography } from '../../components/common/Typography.jsx';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';

const PHONE_REGEX = /^(?:\+?(?:977|91)[\s-]?)?[6789]\d{9}$/;

/**
 * SajiloMarts Customer Profile Management Interface
 * Allows editing of permitted profile fields (name, phone) with validation.
 * Protects immutable/security fields (email, role, verification).
 */
export const ProfileSection = ({
  user,
  onSaveProfile,
  isSaving = false,
  apiError = null,
  successMessage = null,
}) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const validate = () => {
    const newErrors = {};

    if (!formData.name || !formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters long';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Name cannot exceed 100 characters';
    }

    if (formData.phone && formData.phone.trim()) {
      const cleanPhone = formData.phone.trim().replace(/[\s-]/g, '');
      if (!PHONE_REGEX.test(cleanPhone)) {
        newErrors.phone = 'Please provide a valid Nepal (+977) or India (+91) mobile number';
      }
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
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (onSaveProfile) {
      onSaveProfile({
        name: formData.name.trim(),
        phone: formData.phone && formData.phone.trim() ? formData.phone.trim() : null,
      });
    }
  };

  return (
    <Card>
      <CardHeader
        title="Customer Profile Details"
        description="Update your personal contact details used for Indian sourcing and delivery communication"
      />
      <CardBody>
        {apiError && (
          <div className="auth-alert-error" style={{ marginBottom: 'var(--space-4)' }} role="alert">
            {apiError}
          </div>
        )}

        {successMessage && (
          <div className="auth-alert-success" style={{ marginBottom: 'var(--space-4)' }} role="status">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div style={{ display: 'grid', gap: 'var(--space-4)', maxWidth: '540px' }}>
            {/* Full Name Input */}
            <div className="form-group">
              <label className="form-label" htmlFor="profile-name">
                Full Name <span style={{ color: 'var(--color-error)' }}>*</span>
              </label>
              <input
                id="profile-name"
                name="name"
                type="text"
                className={`form-input ${errors.name ? 'input-error' : ''}`}
                value={formData.name}
                onChange={handleChange}
                disabled={isSaving}
                placeholder="Ramesh Sharma"
                required
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            {/* Email (Protected Readonly) */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label" htmlFor="profile-email">
                  Email Address
                </label>
                {user?.isEmailVerified ? (
                  <StatusBadge status="customer_confirmed" label="Verified" />
                ) : (
                  <StatusBadge status="draft" label="Unverified" />
                )}
              </div>
              <input
                id="profile-email"
                type="email"
                className="form-input"
                value={user?.email || ''}
                disabled
                style={{ backgroundColor: 'var(--bg-surface-secondary)', color: 'var(--text-muted)', cursor: 'not-allowed' }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Email address is linked to your verified authentication identity.
              </span>
            </div>

            {/* Phone Number Input */}
            <div className="form-group">
              <label className="form-label" htmlFor="profile-phone">
                Contact Phone Number
              </label>
              <input
                id="profile-phone"
                name="phone"
                type="tel"
                className={`form-input ${errors.phone ? 'input-error' : ''}`}
                value={formData.phone}
                onChange={handleChange}
                disabled={isSaving}
                placeholder="+977 98XXXXXXXX"
              />
              {errors.phone && <span className="error-text">{errors.phone}</span>}
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Used by Kathmandu delivery dispatch for parcel arrival updates.
              </span>
            </div>

            {/* Readonly Account Details */}
            <div
              style={{
                backgroundColor: 'var(--bg-surface-secondary)',
                padding: 'var(--space-3) var(--space-4)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <div><strong>Account Role:</strong> {user?.role || 'Customer'}</div>
              <div>
                <strong>Status:</strong>{' '}
                <span style={{ color: user?.isActive !== false ? 'var(--color-success)' : 'var(--color-error)' }}>
                  {user?.isActive !== false ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <div style={{ marginTop: 'var(--space-2)' }}>
              <Button
                type="submit"
                variant="primary"
                disabled={isSaving}
                aria-busy={isSaving}
              >
                {isSaving ? 'Saving Changes...' : 'Save Profile Changes'}
              </Button>
            </div>
          </div>
        </form>
      </CardBody>
    </Card>
  );
};

export default ProfileSection;
