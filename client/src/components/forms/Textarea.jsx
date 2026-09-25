import React from 'react';

/**
 * SajiloMarts Accessible Textarea Component
 */
export const Textarea = ({
  id,
  name,
  value,
  onChange,
  placeholder,
  rows = 3,
  disabled = false,
  error,
  required = false,
  className = '',
  ...props
}) => {
  const textareaClasses = [
    'form-textarea',
    error ? 'form-textarea--error' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <textarea
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      disabled={disabled}
      required={required}
      aria-invalid={Boolean(error)}
      aria-describedby={
        error ? (id ? `${id}-error` : undefined) : undefined
      }
      className={textareaClasses}
      {...props}
    />
  );
};

export default Textarea;
