import React from 'react';

/**
 * SajiloMarts Accessible Checkbox Component
 */
export const Checkbox = ({
  id,
  name,
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
        type="checkbox"
        id={id}
        name={name}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        {...props}
      />
      {label && <span className="form-check-label">{label}</span>}
    </label>
  );
};

export default Checkbox;
