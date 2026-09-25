import React, { Component } from 'react';
import { Button } from '../common/Button.jsx';
import { Card } from '../common/Card.jsx';

/**
 * SastoMarts Global Frontend Error Boundary
 * Catches unhandled React rendering errors and displays a safe, customer-friendly recovery view.
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    if (typeof console !== 'undefined' && console.error) {
      console.error('[SastoMarts UI ErrorBoundary caught error]:', error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{ maxWidth: '520px', margin: 'var(--space-12) auto', padding: '0 var(--space-4)' }}>
          <Card style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
            <h2 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
              Something went wrong
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.5, marginBottom: 'var(--space-6)' }}>
              We encountered an unexpected problem while rendering this view. Please try reloading the page or return to the home screen.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center' }}>
              <Button variant="primary" onClick={this.handleReset}>
                Reload View
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.location.href = '/';
                  }
                }}
              >
                Go to Home
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
