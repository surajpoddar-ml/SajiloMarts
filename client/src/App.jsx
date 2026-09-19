import { useState, useEffect } from 'react';
import { healthService } from './services';
import { ENV, FEATURE_FLAGS, PUBLIC_CONFIG } from './config';
import './App.css';

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

  return (
    <div className="container">
      <header className="header">
        <div className="logo-badge">
          <span className="logo-dot"></span>
          <span className="logo-text">{PUBLIC_CONFIG.BRAND_NAME}</span>
        </div>
        <span className="step-pill">Prompt 4 of 100 &bull; Configuration &amp; Environment</span>
      </header>

      <main className="hero-section">
        <h1 className="title">
          {PUBLIC_CONFIG.TAGLINE}
        </h1>
        <p className="subtitle">
          Configuration boundaries, environment validation, public vs. private separation, and startup sequencing verified.
        </p>

        <div className="status-card-grid">
          <div className="status-card">
            <div className="card-header">
              <span className="indicator active"></span>
              <span className="card-tag">React Frontend ({ENV.NODE_ENV})</span>
            </div>
            <h3 className="card-title">Client Configuration</h3>
            <p className="card-detail">Target API: <code>{ENV.API_BASE_URL}</code></p>
            <div className="badge-list">
              <span className="badge">Public Config Isolated</span>
              <span className="badge">Flags Active: {Object.keys(FEATURE_FLAGS).length}</span>
            </div>
          </div>

          <div className="status-card">
            <div className="card-header">
              <span className={`indicator ${backendStatus.connected ? 'active' : backendStatus.loading ? 'loading' : 'offline'}`}></span>
              <span className="card-tag">Express Backend</span>
            </div>
            <h3 className="card-title">Server Configuration</h3>
            <p className="card-detail">Target: <code>/api/v1/health</code></p>
            <div className="connection-info">
              {backendStatus.loading ? (
                <span className="status-text loading-text">Validating configuration &amp; connecting...</span>
              ) : backendStatus.connected ? (
                <div className="backend-meta">
                  <span className="status-text success-text">&check; Validated &amp; Online</span>
                  {backendStatus.data?.uptime && (
                    <small className="uptime-info">Uptime: {backendStatus.data.uptime} | Env: {backendStatus.data.environment}</small>
                  )}
                </div>
              ) : (
                <div className="backend-meta">
                  <span className="status-text error-text">&cross; Backend Not Detected</span>
                  <small className="uptime-info">Run <code>npm run dev</code> inside <code>server/</code></small>
                </div>
              )}
            </div>
            <button className="refresh-btn" onClick={checkHealth} type="button">
              Recheck Health
            </button>
          </div>
        </div>

        <div className="foundation-box">
          <h3>Configuration Foundation Standards</h3>
          <ul className="arch-list">
            <li><strong>Zero Secrets in Code:</strong> Private variables accessed exclusively via <code>server/src/config/</code>.</li>
            <li><strong>Environment Validation:</strong> Startup halted gracefully if required configuration fails validation.</li>
            <li><strong>Public / Private Boundary:</strong> Frontend restricted strictly to public <code>VITE_*</code> variables and public config.</li>
            <li><strong>Production Safe Defaults:</strong> Safe fallback defaults in development; strict validation in production.</li>
          </ul>
        </div>
      </main>

      <footer className="footer">
        <p>{PUBLIC_CONFIG.BRAND_NAME} Foundation &copy; {new Date().getFullYear()} &bull; Ready for next development phases</p>
      </footer>
    </div>
  );
}

export default App;
