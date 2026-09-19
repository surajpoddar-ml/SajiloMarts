import { useState, useEffect } from 'react';
import { healthService } from './services';
import { ENV, FEATURE_FLAGS, PUBLIC_CONFIG } from './config';
import { Header, Footer } from './components/layout';
import { StatusCard, FoundationHighlights } from './components/common';
import './App.css';

const ARCHITECTURE_RULES = [
  {
    label: 'JavaScript Only',
    description: 'Strict pure JavaScript (ES2022+ / JSX) across frontend and backend layers.',
  },
  {
    label: 'Architectural Boundaries',
    description: 'Separation of concerns across UI Presentation, Layered Server API, and MongoDB persistence.',
  },
  {
    label: 'Server Authoritative',
    description: 'Critical business rules, quote calculations, and INR-to-NPR peg conversions enforced server-side.',
  },
  {
    label: 'Centralized Configuration',
    description: 'Zero hardcoded secrets, validated runtime environments, and public/private scope isolation.',
  },
  {
    label: 'Documentation & Workflow',
    description: 'Institutionalized Git standards, security guidelines, and 36-step future implementation roadmap.',
  },
];

function App() {
  const [backendStatus, setBackendStatus] = useState({
    loading: true,
    connected: false,
    data: null,
    error: null,
  });

  const checkHealth = async () => {
    setBackendStatus((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const json = await healthService.checkHealth();
      setBackendStatus({
        loading: false,
        connected: true,
        data: json.data || json,
        error: null,
      });
    } catch (err) {
      setBackendStatus({
        loading: false,
        connected: false,
        data: null,
        error: err.message || 'Failed to connect to backend',
      });
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const backendIndicator = backendStatus.connected
    ? 'active'
    : backendStatus.loading
    ? 'loading'
    : 'offline';

  return (
    <div className="container">
      <Header
        brandName={PUBLIC_CONFIG.BRAND_NAME}
        stepLabel="Prompt 8 &bull; MongoDB Atlas &amp; Mongoose Database Foundation"
      />

      <main className="hero-section">
        <h1 className="title">{PUBLIC_CONFIG.TAGLINE}</h1>
        <p className="subtitle">
          MongoDB Atlas &amp; Mongoose database lifecycle, connection pooling, graceful shutdown, and database health check integration established.
        </p>

        <div className="status-card-grid">
          <StatusCard
            statusIndicator="active"
            tag={`React Frontend (${ENV.NODE_ENV})`}
            title="Modular Component Layer"
            detail={`Target API: ${ENV.API_BASE_URL}`}
          >
            <div className="badge-list">
              <span className="badge">Pure JavaScript / JSX</span>
              <span className="badge">Active Flags: {Object.keys(FEATURE_FLAGS).length}</span>
            </div>
          </StatusCard>

          <StatusCard
            statusIndicator={backendIndicator}
            tag="Express Backend"
            title="Layered Architecture API"
            detail="Target: /api/v1/health"
          >
            <div className="connection-info">
              {backendStatus.loading ? (
                <span className="status-text loading-text">Connecting &amp; checking health...</span>
              ) : backendStatus.connected ? (
                <div className="backend-meta">
                  <span className="status-text success-text">&check; Server Online &amp; Healthy</span>
                  {backendStatus.data?.uptime && (
                    <small className="uptime-info">
                      Uptime: {backendStatus.data.uptime} | Env: {backendStatus.data.environment}
                    </small>
                  )}
                </div>
              ) : (
                <div className="backend-meta">
                  <span className="status-text error-text">&cross; Backend Offline</span>
                  <small className="uptime-info">Run <code>npm run dev</code> in <code>server/</code></small>
                </div>
              )}
            </div>
            <button className="refresh-btn" onClick={checkHealth} type="button">
              Recheck Health
            </button>
          </StatusCard>
        </div>

        <FoundationHighlights
          title="Code Quality &amp; Development Standards"
          items={ARCHITECTURE_RULES}
        />
      </main>

      <Footer brandName={PUBLIC_CONFIG.BRAND_NAME} />
    </div>
  );
}

export default App;
