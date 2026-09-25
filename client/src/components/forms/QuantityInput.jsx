import React from 'react';

/**
 * Accessible Quantity Stepper Component
 * Features increment/decrement buttons, min bound of 1, max 1000, keyboard accessibility,
 * and ARIA attributes for screen readers.
 */
export const QuantityInput = ({
  value = 1,
  onChange = () => {},
  min = 1,
  max = 1000,
  disabled = false,
  id = 'quantity-stepper',
  name = 'quantity',
}) => {
  const currentVal = Math.max(min, Math.min(max, parseInt(value, 10) || min));

  const handleDecrement = (e) => {
    e.preventDefault();
    if (currentVal > min && !disabled) {
      onChange(currentVal - 1);
    }
  };

  const handleIncrement = (e) => {
    e.preventDefault();
    if (currentVal < max && !disabled) {
      onChange(currentVal + 1);
    }
  };

  const handleInputChange = (e) => {
    const raw = e.target.value;
    if (raw === '') {
      onChange('');
      return;
    }
    const parsed = parseInt(raw, 10);
    if (!isNaN(parsed)) {
      onChange(Math.max(min, Math.min(max, parsed)));
    }
  };

  const handleBlur = () => {
    if (value === '' || isNaN(parseInt(value, 10)) || parseInt(value, 10) < min) {
      onChange(min);
    }
  };

  return (
    <div
      className="quantity-input-stepper"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'var(--bg-surface)',
        overflow: 'hidden',
        height: '42px',
      }}
    >
      <button
        type="button"
        onClick={handleDecrement}
        disabled={disabled || currentVal <= min}
        aria-label="Decrease quantity"
        style={{
          width: '40px',
          height: '100%',
          border: 'none',
          borderRight: '1px solid var(--border-subtle)',
          backgroundColor: currentVal <= min ? 'var(--bg-surface-secondary)' : 'var(--bg-surface)',
          color: currentVal <= min ? 'var(--text-muted)' : 'var(--text-primary)',
          cursor: currentVal <= min || disabled ? 'not-allowed' : 'pointer',
          fontSize: '1.2rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background-color 0.15s ease',
        }}
      >
        &minus;
      </button>

      <input
        id={id}
        name={name}
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={handleInputChange}
        onBlur={handleBlur}
        disabled={disabled}
        aria-label="Quantity"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={currentVal}
        style={{
          width: '64px',
          height: '100%',
          border: 'none',
          textAlign: 'center',
          fontWeight: 600,
          fontSize: '0.95rem',
          backgroundColor: 'transparent',
          color: 'var(--text-primary)',
          outline: 'none',
          MozAppearance: 'textfield',
        }}
      />

      <button
        type="button"
        onClick={handleIncrement}
        disabled={disabled || currentVal >= max}
        aria-label="Increase quantity"
        style={{
          width: '40px',
          height: '100%',
          border: 'none',
          borderLeft: '1px solid var(--border-subtle)',
          backgroundColor: currentVal >= max ? 'var(--bg-surface-secondary)' : 'var(--bg-surface)',
          color: currentVal >= max ? 'var(--text-muted)' : 'var(--text-primary)',
          cursor: currentVal >= max || disabled ? 'not-allowed' : 'pointer',
          fontSize: '1.2rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background-color 0.15s ease',
        }}
      >
        &#43;
      </button>
    </div>
  );
};

export default QuantityInput;
