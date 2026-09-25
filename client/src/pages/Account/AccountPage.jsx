import React, { useState } from 'react';
import { CustomerPortal } from './CustomerPortal.jsx';
import { AccountOverview } from './AccountOverview.jsx';
import { ProfileSection } from './ProfileSection.jsx';
import { SecuritySection } from './SecuritySection.jsx';
import { authService } from '../../services/auth.service.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Container } from '../../components/layout/Container.jsx';

/**
 * SajiloMarts Authenticated Customer Account Page
 * Manages tab state, profile update lifecycle, and account settings.
 */
export const AccountPage = ({
  initialTab = 'overview',
  onNavigate = () => {},
  onLogout,
}) => {
  const { user, refreshUser, logout } = useAuth();
  const { showSuccess, showError } = useToast();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isSaving, setIsSaving] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

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
    if (['requests', 'orders', 'history', 'addresses'].includes(tabId)) {
      if (tabId === 'requests') onNavigate('sourcing-requests');
      if (tabId === 'orders') onNavigate('current-orders');
      if (tabId === 'history') onNavigate('order-history');
      if (tabId === 'addresses') onNavigate('addresses');
      return;
    }
    setActiveTab(tabId);
  };

  const handleSaveProfile = async (profileData) => {
    setIsSaving(true);
    setApiError(null);
    setSuccessMessage(null);

    try {
      const res = await authService.updateProfile(profileData);
      const updatedUser = res.data || res.user || res;
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
              onNavigate('sourcing-requests');
            } else if (view === 'sourcing-new') {
              onNavigate('sourcing-new');
            } else if (view === 'current-orders') {
              onNavigate('current-orders');
            } else if (view === 'addresses') {
              onNavigate('addresses');
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
