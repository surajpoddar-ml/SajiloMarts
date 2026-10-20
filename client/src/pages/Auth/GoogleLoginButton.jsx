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

  const DEFAULT_GOOGLE_CLIENT_ID = '753247567662-m5j6djst82f545afd48t04fkr9c5v5mc.apps.googleusercontent.com';
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || DEFAULT_GOOGLE_CLIENT_ID;

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

  // Render branded button with helpful guidance if Google Client ID is not yet provided in env
  if (!googleClientId) {
    return (
      <div style={{ width: '100%', margin: '8px 0' }}>
        <button
          type="button"
          onClick={() => {
            alert('To connect live Google accounts, please add VITE_GOOGLE_CLIENT_ID to your environment variables in Vercel settings.');
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            width: '100%',
            padding: '10px 16px',
            backgroundColor: '#ffffff',
            color: '#374151',
            border: '1px solid #D1D5DB',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'background-color 0.15s ease',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#F9FAFB')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Continue with Google
        </button>
      </div>
    );
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

