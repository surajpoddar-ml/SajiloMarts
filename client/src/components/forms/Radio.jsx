import React from 'react';

/**
 * SastoMarts Accessible Radio Component
 */
export const Radio = ({
  id,
  name,
  value,
  checked,
  onChange,
  label,
  disabled = false,
  className = '',
  ...props
}) => {
  return (
    <label htmlFor={id} className={`form-check ${className}`.trim()}>
      <input
        type="radio"
        id={id}
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        {...props}
      />
      {label && <span className="form-check-label">{label}</span>}
    </label>
  );
};

export default Radio;
