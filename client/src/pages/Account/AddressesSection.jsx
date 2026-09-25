import React, { useState, useEffect } from 'react';
import { addressService } from '../../services/address.service.js';
import { Card, CardHeader, CardBody } from '../../components/common/Card.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Typography } from '../../components/common/Typography.jsx';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { Spinner } from '../../components/feedback/Spinner.jsx';
import { useToast } from '../../context/ToastContext.jsx';

/**
 * SajiloMarts Customer Address Management
 * Displays verified Nepal delivery destinations, default badges, and address management actions.
 */
export const AddressesSection = ({
  onAddAddress,
  onEditAddress,
}) => {
  const { showSuccess, showError } = useToast();
  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchAddresses = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await addressService.getAddresses();
      const list = res.data || res || [];
      setAddresses(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err.message || 'Failed to load delivery addresses.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleSetDefault = async (addressId) => {
    setActionLoadingId(addressId);
    try {
      await addressService.setDefaultShipping(addressId);
      showSuccess('Default delivery address updated.');
      await fetchAddresses();
    } catch (err) {
      showError(err.message || 'Failed to set default address.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (addressId) => {
    if (!window.confirm('Are you sure you want to remove this delivery address?')) return;
    setActionLoadingId(addressId);
    try {
      await addressService.deleteAddress(addressId);
      showSuccess('Address removed.');
      await fetchAddresses();
    } catch (err) {
      showError(err.message || 'Failed to delete address.');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="addresses-section" style={{ maxWidth: '960px', margin: '0 auto' }}>
      <Card>
        <CardHeader
          title="Verified Delivery Addresses"
          description="Manage your doorstep delivery destinations in Nepal for cross-border parcel dispatch"
          action={
            onAddAddress && (
              <Button size="sm" variant="primary" onClick={onAddAddress}>
                + Add New Address
              </Button>
            )
          }
        />
        <CardBody>
          {error && (
            <div
              role="alert"
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: 'var(--color-error)',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span><strong>Error:</strong> {error}</span>
              <Button size="sm" variant="outline" onClick={fetchAddresses}>
                Retry
              </Button>
            </div>
          )}

          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '3rem 0' }}>
              <Spinner size="md" />
              <Typography variant="body" style={{ marginTop: 'var(--space-3)', color: 'var(--text-secondary)' }}>
                Loading your delivery addresses...
              </Typography>
            </div>
          ) : addresses.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '3.5rem 1.5rem',
                backgroundColor: 'var(--bg-surface-secondary)',
                borderRadius: 'var(--radius-md)',
                border: '1px dashed var(--border-subtle)',
              }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📍</div>
              <Typography variant="h3" style={{ fontSize: '1.2rem', marginBottom: '6px' }}>
                No delivery addresses yet.
              </Typography>
              <Typography
                variant="body"
                style={{
                  color: 'var(--text-secondary)',
                  maxWidth: '460px',
                  margin: '0 auto var(--space-6)',
                  fontSize: '0.9rem',
                }}
              >
                Add your home or office address in Nepal to speed up quote checkout and courier doorstep fulfillment.
              </Typography>
              {onAddAddress && (
                <Button variant="primary" onClick={onAddAddress}>
                  Add Delivery Address
                </Button>
              )}
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 'var(--space-4)',
              }}
            >
              {addresses.map((addr) => {
                const addrId = addr._id || addr.id;
                const isDefault = Boolean(addr.isDefaultShipping);

                return (
                  <div
                    key={addrId}
                    style={{
                      border: isDefault ? '2px solid var(--color-brand)' : '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: 'var(--space-4)',
                      backgroundColor: 'var(--bg-surface)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: 'var(--space-3)',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                          {addr.label || 'Home'}
                        </span>
                        {isDefault ? (
                          <StatusBadge status="customer_confirmed" label="Default Shipping" />
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSetDefault(addrId)}
                            disabled={actionLoadingId === addrId}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--color-brand)',
                              fontSize: '0.78rem',
                              cursor: 'pointer',
                              padding: 0,
                              textDecoration: 'underline',
                            }}
                          >
                            Set as Default
                          </button>
                        )}
                      </div>

                      <strong style={{ fontSize: '1.05rem', color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                        {addr.fullName}
                      </strong>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                        📞 {addr.phone}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                        {addr.tole}, Ward {addr.wardNumber || ''}<br />
                        {addr.municipality}, {addr.district}<br />
                        {addr.province}, {addr.country || 'Nepal'}
                      </div>
                      {addr.landmark && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                          Landmark: {addr.landmark}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px', marginTop: '4px' }}>
                      {onEditAddress && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onEditAddress(addr)}
                          style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                        >
                          Edit
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(addrId)}
                        disabled={actionLoadingId === addrId}
                        style={{ padding: '4px 8px', fontSize: '0.8rem', color: 'var(--color-error)' }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default AddressesSection;
