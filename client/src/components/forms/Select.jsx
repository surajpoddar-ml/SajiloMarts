import React from 'react';

/**
 * SajiloMarts Accessible Select Component
 */
export const Select = ({
  id,
  name,
  value,
  onChange,
  options = [],
  disabled = false,
  error,
  required = false,
  className = '',
  children,
  ...props
}) => {
  const selectClasses = [
    'form-select',
    error ? 'form-select--error' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <select
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      required={required}
      aria-invalid={Boolean(error)}
      aria-describedby={
        error ? (id ? `${id}-error` : undefined) : undefined
      }
      className={selectClasses}
      {...props}
    >
      {options.length > 0
        ? options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))
        : children}
    </select>
  );
};

export default Select;
