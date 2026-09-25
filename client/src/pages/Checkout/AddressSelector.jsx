import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, Button, Typography, StatusBadge } from '../../components/common';
import { Spinner } from '../../components/feedback/Spinner.jsx';
import { addressService } from '../../services/address.service.js';

/**
 * AddressSelector
 * Provides real address selection from the authenticated customer's saved address book.
 * No dummy address data allowed.
 */
export const AddressSelector = ({
  selectedAddressId,
  onSelectAddress,
  disabled = false,
}) => {
  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    province: 'Bagmati Province',
    district: 'Kathmandu',
    municipality: 'Kathmandu Metropolitan City',
    wardNumber: 1,
    tole: '',
    street: '',
    landmark: '',
    label: 'home',
  });

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await addressService.getAddresses();
      const addrList = response?.data || response || [];
      const validAddrs = Array.isArray(addrList) ? addrList : [];
      setAddresses(validAddrs);

      // Auto-select first or default address if not selected
      if (validAddrs.length > 0 && !selectedAddressId) {
        const defaultAddr = validAddrs.find((a) => a.isDefaultShipping) || validAddrs[0];
        onSelectAddress(defaultAddr._id || defaultAddr.id);
      }
    } catch (err) {
      setError(err.message || 'Failed to load delivery addresses');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAddress = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        wardNumber: Number(formData.wardNumber),
      };
      const res = await addressService.addAddress(payload);
      const created = res.data || res;
      setShowAddForm(false);
      await loadAddresses();
      if (created?._id || created?.id) {
        onSelectAddress(created._id || created.id);
      }
    } catch (err) {
      setError(err.message || 'Failed to add delivery address');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Card style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
        <Spinner size="md" />
        <Typography variant="body" style={{ marginTop: 'var(--space-2)', color: 'var(--text-secondary)' }}>
          Loading saved delivery addresses...
        </Typography>
      </Card>
    );
  }

  return (
    <Card className="address-selector-card" style={{ marginBottom: 'var(--space-6)' }}>
      <CardHeader>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <Typography variant="h3" style={{ fontSize: '1.25rem', fontWeight: 600 }}>
              Delivery Address in Nepal
            </Typography>
            <Typography variant="caption" style={{ color: 'var(--text-secondary)' }}>
              Select where SajiloMarts will deliver your order
            </Typography>
          </div>
          {!showAddForm && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddForm(true)}
              disabled={disabled}
            >
              + Add New Address
            </Button>
          )}
        </div>
      </CardHeader>

      <CardBody>
        {error && (
          <div
            role="alert"
            style={{
              padding: 'var(--space-3)',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid var(--color-error)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-error)',
              fontSize: '0.875rem',
              marginBottom: 'var(--space-4)',
            }}
          >
            {error}
          </div>
        )}

        {showAddForm ? (
          <form onSubmit={handleCreateAddress} style={{ display: 'grid', gap: 'var(--space-3)' }}>
            <Typography variant="h4" style={{ fontSize: '1rem', fontWeight: 600 }}>
              New Delivery Address Details
            </Typography>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-3)' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '4px' }}>
                  Recipient Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g., Ram Bahadur Shrestha"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '4px' }}>
                  Contact Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="98XXXXXXXX / 97XXXXXXXX"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-3)' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '4px' }}>
                  Province *
                </label>
                <input
                  type="text"
                  required
                  value={formData.province}
                  onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '4px' }}>
                  District *
                </label>
                <input
                  type="text"
                  required
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '4px' }}>
                  Municipality / City *
                </label>
                <input
                  type="text"
                  required
                  value={formData.municipality}
                  onChange={(e) => setFormData({ ...formData, municipality: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '4px' }}>
                  Ward Number *
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  required
                  value={formData.wardNumber}
                  onChange={(e) => setFormData({ ...formData, wardNumber: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-3)' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '4px' }}>
                  Tole / Locality *
                </label>
                <input
                  type="text"
                  required
                  value={formData.tole}
                  onChange={(e) => setFormData({ ...formData, tole: e.target.value })}
                  placeholder="e.g., Baneshwor, Thamel, etc."
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '4px' }}>
                  Street / Landmark (Optional)
                </label>
                <input
                  type="text"
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  placeholder="e.g., Near City Center"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
              <Button type="button" variant="outline" size="sm" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
                {isSubmitting ? 'Saving Address...' : 'Save & Select Address'}
              </Button>
            </div>
          </form>
        ) : addresses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-6) 0' }}>
            <Typography variant="body" style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-3)' }}>
              You have no saved delivery address in Nepal.
            </Typography>
            <Button variant="primary" size="sm" onClick={() => setShowAddForm(true)}>
              + Add Delivery Address
            </Button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
            {addresses.map((addr) => {
              const id = addr._id || addr.id;
              const isSelected = selectedAddressId === id;

              return (
                <label
                  key={id}
                  htmlFor={`address-${id}`}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 'var(--space-3)',
                    padding: 'var(--space-4)',
                    borderRadius: 'var(--radius-md)',
                    border: `1.5px solid ${isSelected ? 'var(--color-brand)' : 'var(--border-color)'}`,
                    backgroundColor: isSelected ? 'var(--color-brand-50, rgba(37, 99, 235, 0.04))' : 'var(--bg-primary)',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <input
                    type="radio"
                    id={`address-${id}`}
                    name="selectedDeliveryAddress"
                    value={id}
                    checked={isSelected}
                    onChange={() => onSelectAddress(id)}
                    disabled={disabled}
                    style={{ marginTop: '4px', accentColor: 'var(--color-brand)' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                      <Typography variant="body" style={{ fontWeight: 600 }}>
                        {addr.fullName}
                      </Typography>
                      <StatusBadge status="info">
                        {addr.label || 'Home'}
                      </StatusBadge>
                    </div>
                    <Typography variant="caption" style={{ color: 'var(--text-secondary)', display: 'block' }}>
                      Phone: {addr.phone}
                    </Typography>
                    <Typography variant="body" style={{ fontSize: '0.875rem', marginTop: '4px' }}>
                      {[addr.tole, addr.street, `Ward ${addr.wardNumber}`, addr.municipality, addr.district, addr.province, addr.country || 'Nepal']
                        .filter(Boolean)
                        .join(', ')}
                    </Typography>
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default AddressSelector;
