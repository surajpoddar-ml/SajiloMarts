import React, { useState } from 'react';
import { CustomerPortal } from './CustomerPortal.jsx';
import { AccountOverview } from './AccountOverview.jsx';
import { ProfileSection } from './ProfileSection.jsx';
import { SecuritySection } from './SecuritySection.jsx';
import { AddressesSection } from './AddressesSection.jsx';
import { AddressModal } from './AddressModal.jsx';
import { CurrentOrders } from '../Orders/CurrentOrders.jsx';
import { OrderHistory } from '../Orders/OrderHistory.jsx';
import { OrderDetail } from '../Orders/OrderDetail.jsx';
import { SourcingRequestList, SourcingRequestDetail } from '../Quotes';
import { authService } from '../../services/auth.service.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Spinner } from '../../components/feedback/Spinner.jsx';

/**
 * SajiloMarts Authenticated Customer Account Page
 * Unifies account overview, profile settings, sourcing requests, active orders,
 * order history, address management, and account security.
 */
export const AccountPage = ({
  initialTab = 'overview',
  onNavigate = () => {},
  onLogout,
}) => {
  const { user, refreshUser, logout, isLoading: isAuthLoading } = useAuth();
  const { showSuccess, showError } = useToast();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isSaving, setIsSaving] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Address modal state
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressRefreshKey, setAddressRefreshKey] = useState(0);

  // Selected item states
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const handleLogout = async () => {
    if (onLogout) {
      await onLogout();
    } else if (logout) {
      await logout();
      onNavigate('login');
    }
  };

  const handleTabChange = (tabId) => {
    setApiError(null);
    setSuccessMessage(null);
    setSelectedRequestId(null);
    setSelectedOrderId(null);
    setActiveTab(tabId);
  };

  const handleSaveProfile = async (profileData) => {
    setIsSaving(true);
    setApiError(null);
    setSuccessMessage(null);

    try {
      const res = await authService.updateProfile(profileData);
      setSuccessMessage('Your profile details have been saved successfully.');
      showSuccess('Profile updated successfully');
      if (refreshUser) {
        await refreshUser();
      }
    } catch (err) {
      const msg = err.message || 'Failed to update profile. Please try again.';
      setApiError(msg);
      showError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  if (isAuthLoading && !user) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <Spinner size="lg" />
        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading customer account...</p>
      </div>
    );
  }

  return (
    <CustomerPortal
      activeTab={activeTab}
      onTabChange={handleTabChange}
      onLogout={handleLogout}
    >
      {activeTab === 'overview' && (
        <AccountOverview
          user={user}
          onNavigate={(view) => {
            if (view === 'resend-verification') {
              onNavigate('resend-verification');
            } else if (view === 'sourcing-requests') {
              setActiveTab('requests');
            } else if (view === 'sourcing-new') {
              onNavigate('sourcing-new');
            } else if (view === 'current-orders') {
              setActiveTab('orders');
            } else if (view === 'addresses') {
              setActiveTab('addresses');
            } else if (view === 'account-security') {
              setActiveTab('security');
            } else {
              onNavigate(view);
            }
          }}
        />
      )}

      {activeTab === 'profile' && (
        <ProfileSection
          user={user}
          onSaveProfile={handleSaveProfile}
          isSaving={isSaving}
          apiError={apiError}
          successMessage={successMessage}
        />
      )}

      {activeTab === 'requests' && (
        selectedRequestId ? (
          <SourcingRequestDetail
            requestId={selectedRequestId}
            onBack={() => setSelectedRequestId(null)}
            onProceedToCheckout={(id) => {
              onNavigate('checkout');
            }}
            onStatusUpdated={() => {}}
          />
        ) : (
          <SourcingRequestList
            onCreateNew={() => onNavigate('sourcing-new')}
            onSelectRequest={(id) => setSelectedRequestId(id)}
          />
        )
      )}

      {activeTab === 'orders' && (
        selectedOrderId ? (
          <OrderDetail
            orderId={selectedOrderId}
            onBack={() => setSelectedOrderId(null)}
          />
        ) : (
          <CurrentOrders
            onSelectOrder={(id) => setSelectedOrderId(id)}
            onStartSourcing={() => onNavigate('sourcing-new')}
          />
        )
      )}

      {activeTab === 'history' && (
        selectedOrderId ? (
          <OrderDetail
            orderId={selectedOrderId}
            onBack={() => setSelectedOrderId(null)}
          />
        ) : (
          <OrderHistory
            onSelectOrder={(id) => setSelectedOrderId(id)}
            onStartSourcing={() => onNavigate('sourcing-new')}
          />
        )
      )}

      {activeTab === 'addresses' && (
        <>
          <AddressesSection
            key={addressRefreshKey}
            onAddAddress={() => {
              setEditingAddress(null);
              setIsAddressModalOpen(true);
            }}
            onEditAddress={(addr) => {
              setEditingAddress(addr);
              setIsAddressModalOpen(true);
            }}
          />
          {isAddressModalOpen && (
            <AddressModal
              address={editingAddress}
              onClose={() => {
                setIsAddressModalOpen(false);
                setEditingAddress(null);
              }}
              onSaved={() => {
                setIsAddressModalOpen(false);
                setEditingAddress(null);
                setAddressRefreshKey((k) => k + 1);
              }}
            />
          )}
        </>
      )}

      {activeTab === 'security' && (
        <SecuritySection
          user={user}
          onNavigate={onNavigate}
        />
      )}
    </CustomerPortal>
  );
};

export default AccountPage;
