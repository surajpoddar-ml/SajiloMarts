import React from 'react';

/**
 * SajiloMarts Accessible Input Component
 */
export const Input = ({
  id,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  disabled = false,
  error,
  required = false,
  className = '',
  ...props
}) => {
  const inputClasses = [
    'form-input',
    error ? 'form-input--error' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <input
      id={id}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      required={required}
      aria-invalid={Boolean(error)}
      aria-describedby={
        error ? (id ? `${id}-error` : undefined) : undefined
      }
      className={inputClasses}
      {...props}
    />
  );
};

export default Input;
