import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../hooks/useAuth.js';

/**
 * Google Sign-In Button Component
 * Uses Google Identity Services (GSI) to render an official Google button
 * and verify the credential with the SastoMarts backend API.
 */
export const GoogleLoginButton = ({ onSuccess, onError, text = 'continue_with' }) => {
  const { loginWithGoogle } = useAuth();
  const buttonRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  // Dynamically load Google Identity Services SDK
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (window.google?.accounts?.id) {
      setScriptLoaded(true);
      return;
    }

    const existingScript = document.getElementById('google-gsi-script');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'google-gsi-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => setScriptLoaded(true);
      script.onerror = () => {
        console.warn('Failed to load Google Identity Services script');
      };
      document.body.appendChild(script);
    } else {
      existingScript.addEventListener('load', () => setScriptLoaded(true));
    }
  }, []);

  const handleCredentialResponse = async (response) => {
    if (!response || !response.credential) {
      if (onError) onError('No credential received from Google');
      return;
    }

    setIsLoading(true);
    try {
      await loginWithGoogle(response.credential);
      if (onSuccess) onSuccess();
    } catch (err) {
      if (onError) onError(err.message || 'Google authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Render official Google button when script and client ID are available
  useEffect(() => {
    if (!scriptLoaded || !googleClientId || !buttonRef.current || !window.google?.accounts?.id) {
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      window.google.accounts.id.renderButton(buttonRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text,
        shape: 'rectangular',
        logo_alignment: 'left',
        width: buttonRef.current.offsetWidth || 340,
      });
    } catch (err) {
      console.warn('Google Identity button initialization error:', err);
    }
  }, [scriptLoaded, googleClientId, text]);

  // Do not render button if Google Client ID is not yet provided
  if (!googleClientId) {
    return null;
  }

  return (
    <div style={{ width: '100%', margin: '12px 0', minHeight: '44px', display: 'flex', justifyContent: 'center' }}>
      {isLoading ? (
        <div style={{ fontSize: '0.875rem', color: '#6B7280', padding: '10px' }}>
          Signing in with Google...
        </div>
      ) : (
        <div ref={buttonRef} style={{ width: '100%', display: 'flex', justifyContent: 'center' }} />
      )}
    </div>
  );
};

export default GoogleLoginButton;

