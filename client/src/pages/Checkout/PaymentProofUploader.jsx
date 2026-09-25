import React, { useRef, useState } from 'react';
import { Card, CardHeader, CardBody, Typography, Button } from '../../components/common';
import { Spinner } from '../../components/feedback/Spinner.jsx';

const ACCEPTED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * PaymentProofUploader
 * Component allowing customer to select, validate, and preview payment proof screenshot.
 */
export const PaymentProofUploader = ({
  file = null,
  onFileSelect,
  onFileRemove,
  error = null,
  isUploading = false,
  uploadProgress = 0,
  disabled = false,
}) => {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (selectedFile) => {
    if (!selectedFile) return;
    if (onFileSelect) {
      onFileSelect(selectedFile);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || isUploading) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className="checkout-payment-proof" style={{ backgroundColor: 'var(--bg-surface)' }}>
      <CardHeader
        title="Payment Proof Upload"
        description="Attach a clear screenshot or photo of your completed payment receipt (JPEG, PNG, WebP — max 5MB)"
      />
      <CardBody>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          style={{ display: 'none' }}
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileChange(e.target.files[0]);
            }
          }}
          disabled={disabled || isUploading}
          aria-label="Upload Payment Proof"
        />

        {!file ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              if (!disabled && !isUploading) setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => {
              if (!disabled && !isUploading && fileInputRef.current) {
                fileInputRef.current.click();
              }
            }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '32px 20px',
              borderRadius: 'var(--radius-md)',
              border: isDragging ? '2px dashed var(--color-brand)' : error ? '2px dashed var(--color-error)' : '2px dashed var(--border-subtle)',
              backgroundColor: isDragging ? 'var(--bg-surface-secondary)' : 'var(--bg-surface)',
              cursor: disabled || isUploading ? 'not-allowed' : 'pointer',
              textAlign: 'center',
              transition: 'border-color 0.2s ease, background-color 0.2s ease',
            }}
          >
            <div style={{ fontSize: '2.2rem', marginBottom: '8px' }} aria-hidden="true">
              📸
            </div>
            <Typography variant="h3" style={{ fontSize: '1rem', marginBottom: '4px' }}>
              Click to select or drag and drop receipt screenshot
            </Typography>
            <Typography variant="caption" style={{ color: 'var(--text-secondary)' }}>
              Accepted formats: JPEG, PNG, WebP (Up to 5 MB)
            </Typography>

            <Button
              type="button"
              variant="outline"
              size="sm"
              style={{ marginTop: '16px' }}
              disabled={disabled || isUploading}
            >
              Choose File
            </Button>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            padding: '16px',
            backgroundColor: 'var(--bg-surface-secondary)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.5rem' }} aria-hidden="true">📄</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', wordBreak: 'break-all' }}>
                    {file.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {formatFileSize(file.size)} &bull; {file.type || 'Image'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (fileInputRef.current) fileInputRef.current.click();
                  }}
                  disabled={disabled || isUploading}
                >
                  Change
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onFileRemove}
                  disabled={disabled || isUploading}
                  style={{ color: 'var(--color-error)', borderColor: 'var(--color-error-border)' }}
                >
                  Remove
                </Button>
              </div>
            </div>

            {isUploading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <Spinner size="sm" />
                <span>Uploading payment proof ({uploadProgress}%)...</span>
              </div>
            )}
          </div>
        )}

        {error && (
          <div
            role="alert"
            style={{
              color: 'var(--color-error)',
              fontSize: '0.825rem',
              marginTop: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default PaymentProofUploader;
