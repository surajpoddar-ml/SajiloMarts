import React from 'react';

/**
 * SastoMarts Accessible Form Field Wrapper
 */
export const FormField = ({
  id,
  label,
  required = false,
  error,
  helperText,
  children,
  className = '',
}) => {
  return (
    <div className={`form-group ${className}`.trim()}>
      {label && (
        <label
          htmlFor={id}
          className={`form-label ${required ? 'form-label--required' : ''}`.trim()}
        >
          {label}
        </label>
      )}
      {children}
      {error && (
        <div className="form-error" id={id ? `${id}-error` : undefined} role="alert">
          {error}
        </div>
      )}
      {!error && helperText && (
        <div className="form-helper" id={id ? `${id}-helper` : undefined}>
          {helperText}
        </div>
      )}
    </div>
  );
};

export default FormField;
