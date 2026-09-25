import React, { useState, useEffect } from 'react';
import { Button } from '../../components/common/Button.jsx';
import { Typography } from '../../components/common/Typography.jsx';

const NEPAL_PROVINCES = [
  'Bagmati Province',
  'Koshi Province',
  'Madhesh Province',
  'Gandaki Province',
  'Lumbini Province',
  'Karnali Province',
  'Sudurpashchim Province',
];

const PHONE_REGEX = /^(?:\+?(?:977|91)[\s-]?)?[6789]\d{9}$/;

/**
 * SajiloMarts Address Creation & Edit Modal Form
 * Full Nepal delivery destination form with strict client-side validation.
 */
export const AddressModal = ({
  isOpen = false,
  onClose = () => {},
  onSave = () => {},
  initialData = null,
  isSaving = false,
}) => {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    province: 'Bagmati Province',
    district: 'Kathmandu',
    municipality: 'Kathmandu Metropolitan City',
    wardNumber: '1',
    tole: '',
    landmark: '',
    label: 'home',
    isDefaultShipping: false,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        fullName: initialData.fullName || '',
        phone: initialData.phone || '',
        province: initialData.province || 'Bagmati Province',
        district: initialData.district || '',
        municipality: initialData.municipality || '',
        wardNumber: initialData.wardNumber ? String(initialData.wardNumber) : '1',
        tole: initialData.tole || '',
        landmark: initialData.landmark || '',
        label: initialData.label || 'home',
        isDefaultShipping: Boolean(initialData.isDefaultShipping),
      });
    } else {
      setFormData({
        fullName: '',
        phone: '',
        province: 'Bagmati Province',
        district: 'Kathmandu',
        municipality: 'Kathmandu Metropolitan City',
        wardNumber: '1',
        tole: '',
        landmark: '',
        label: 'home',
        isDefaultShipping: false,
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Recipient full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Recipient name must be at least 2 characters';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Delivery contact phone number is required';
    } else {
      const cleanPhone = formData.phone.trim().replace(/[\s-]/g, '');
      if (!PHONE_REGEX.test(cleanPhone)) {
        newErrors.phone = 'Please provide a valid Nepal (+977) mobile number';
      }
    }

    if (!formData.province.trim()) {
      newErrors.province = 'Province is required';
    }

    if (!formData.district.trim()) {
      newErrors.district = 'District is required';
    }

    if (!formData.municipality.trim()) {
      newErrors.municipality = 'Municipality / City is required';
    }

    const wardNum = parseInt(formData.wardNumber, 10);
    if (isNaN(wardNum) || wardNum < 1 || wardNum > 50) {
      newErrors.wardNumber = 'Ward number must be between 1 and 50';
    }

    if (!formData.tole.trim()) {
      newErrors.tole = 'Tole / Locality is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSave({
      ...formData,
      fullName: formData.fullName.trim(),
      phone: formData.phone.trim(),
      district: formData.district.trim(),
      municipality: formData.municipality.trim(),
      wardNumber: parseInt(formData.wardNumber, 10),
      tole: formData.tole.trim(),
      landmark: formData.landmark.trim() || null,
      country: 'Nepal',
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999,
        padding: '1rem',
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="address-modal-title"
    >
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          width: '100%',
          maxWidth: '560px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div
          style={{
            padding: 'var(--space-4) var(--space-6)',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h2 id="address-modal-title" style={{ fontSize: '1.2rem', margin: 0, color: 'var(--text-primary)' }}>
            {initialData ? 'Edit Delivery Address' : 'Add New Nepal Delivery Address'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.4rem',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              lineHeight: 1,
            }}
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: 'var(--space-6)' }} noValidate>
          <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
            {/* Recipient Full Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="addr-fullName">
                Recipient Full Name <span style={{ color: 'var(--color-error)' }}>*</span>
              </label>
              <input
                id="addr-fullName"
                name="fullName"
                type="text"
                className={`form-input ${errors.fullName ? 'input-error' : ''}`}
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Ramesh Sharma"
                disabled={isSaving}
              />
              {errors.fullName && <span className="error-text">{errors.fullName}</span>}
            </div>

            {/* Delivery Phone */}
            <div className="form-group">
              <label className="form-label" htmlFor="addr-phone">
                Contact Phone <span style={{ color: 'var(--color-error)' }}>*</span>
              </label>
              <input
                id="addr-phone"
                name="phone"
                type="tel"
                className={`form-input ${errors.phone ? 'input-error' : ''}`}
                value={formData.phone}
                onChange={handleChange}
                placeholder="+977 98XXXXXXXX"
                disabled={isSaving}
              />
              {errors.phone && <span className="error-text">{errors.phone}</span>}
            </div>

            {/* Province & District */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="addr-province">
                  Province <span style={{ color: 'var(--color-error)' }}>*</span>
                </label>
                <select
                  id="addr-province"
                  name="province"
                  className={`form-input ${errors.province ? 'input-error' : ''}`}
                  value={formData.province}
                  onChange={handleChange}
                  disabled={isSaving}
                >
                  {NEPAL_PROVINCES.map((prov) => (
                    <option key={prov} value={prov}>{prov}</option>
                  ))}
                </select>
                {errors.province && <span className="error-text">{errors.province}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="addr-district">
                  District <span style={{ color: 'var(--color-error)' }}>*</span>
                </label>
                <input
                  id="addr-district"
                  name="district"
                  type="text"
                  className={`form-input ${errors.district ? 'input-error' : ''}`}
                  value={formData.district}
                  onChange={handleChange}
                  placeholder="Kathmandu"
                  disabled={isSaving}
                />
                {errors.district && <span className="error-text">{errors.district}</span>}
              </div>
            </div>

            {/* Municipality & Ward */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-3)' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="addr-municipality">
                  Municipality / City <span style={{ color: 'var(--color-error)' }}>*</span>
                </label>
                <input
                  id="addr-municipality"
                  name="municipality"
                  type="text"
                  className={`form-input ${errors.municipality ? 'input-error' : ''}`}
                  value={formData.municipality}
                  onChange={handleChange}
                  placeholder="Kathmandu Metropolitan City"
                  disabled={isSaving}
                />
                {errors.municipality && <span className="error-text">{errors.municipality}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="addr-wardNumber">
                  Ward No. <span style={{ color: 'var(--color-error)' }}>*</span>
                </label>
                <input
                  id="addr-wardNumber"
                  name="wardNumber"
                  type="number"
                  min="1"
                  max="50"
                  className={`form-input ${errors.wardNumber ? 'input-error' : ''}`}
                  value={formData.wardNumber}
                  onChange={handleChange}
                  placeholder="3"
                  disabled={isSaving}
                />
                {errors.wardNumber && <span className="error-text">{errors.wardNumber}</span>}
              </div>
            </div>

            {/* Tole / Street */}
            <div className="form-group">
              <label className="form-label" htmlFor="addr-tole">
                Tole / Locality / Street <span style={{ color: 'var(--color-error)' }}>*</span>
              </label>
              <input
                id="addr-tole"
                name="tole"
                type="text"
                className={`form-input ${errors.tole ? 'input-error' : ''}`}
                value={formData.tole}
                onChange={handleChange}
                placeholder="Putalisadak, Near Star Mall"
                disabled={isSaving}
              />
              {errors.tole && <span className="error-text">{errors.tole}</span>}
            </div>

            {/* Landmark (Optional) */}
            <div className="form-group">
              <label className="form-label" htmlFor="addr-landmark">
                Nearby Landmark (Optional)
              </label>
              <input
                id="addr-landmark"
                name="landmark"
                type="text"
                className="form-input"
                value={formData.landmark}
                onChange={handleChange}
                placeholder="Opposite to Bank of Kathmandu"
                disabled={isSaving}
              />
            </div>

            {/* Address Label */}
            <div className="form-group">
              <label className="form-label">Address Label</label>
              <div style={{ display: 'flex', gap: '12px' }}>
                {['home', 'work', 'other'].map((lbl) => (
                  <label key={lbl} style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '0.875rem', textTransform: 'capitalize' }}>
                    <input
                      type="radio"
                      name="label"
                      value={lbl}
                      checked={formData.label === lbl}
                      onChange={handleChange}
                      disabled={isSaving}
                    />
                    {lbl}
                  </label>
                ))}
              </div>
            </div>

            {/* Set as Default Checkbox */}
            <div style={{ marginTop: 'var(--space-2)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                <input
                  type="checkbox"
                  name="isDefaultShipping"
                  checked={formData.isDefaultShipping}
                  onChange={handleChange}
                  disabled={isSaving}
                />
                <strong>Set as default shipping address</strong>
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: 'var(--space-6)', borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-4)' }}>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSaving}
              aria-busy={isSaving}
            >
              {isSaving ? 'Saving Address...' : 'Save Address'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddressModal;
