import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [backendStatus, setBackendStatus] = useState({
    loading: true,
    connected: false,
    data: null,
    error: null,
  });

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

  const checkHealth = async () => {
    setBackendStatus((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await fetch(`${apiBaseUrl}/health`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const json = await response.json();
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
          <span className="logo-text">SastoMarts</span>
        </div>
        <span className="step-pill">Prompt 1 of 100 &bull; Project Foundation</span>
      </header>

      <main className="hero-section">
        <h1 className="title">
          India &rarr; Nepal Cross-Border E-Commerce & Sourcing
        </h1>
        <p className="subtitle">
          Production-grade MERN architecture foundation initialized successfully. Clean separation of frontend and backend services.
        </p>

        <div className="status-card-grid">
          <div className="status-card">
            <div className="card-header">
              <span className="indicator active"></span>
              <span className="card-tag">React Frontend</span>
            </div>
            <h3 className="card-title">Vite + React (SPA)</h3>
            <p className="card-detail">Running on <code>http://localhost:5173</code></p>
            <div className="badge-list">
              <span className="badge">Clean Component Architecture</span>
              <span className="badge">Vite HMR</span>
            </div>
          </div>

          <div className="status-card">
            <div className="card-header">
              <span className={`indicator ${backendStatus.connected ? 'active' : backendStatus.loading ? 'loading' : 'offline'}`}></span>
              <span className="card-tag">Express Backend</span>
            </div>
            <h3 className="card-title">Node.js + Express API</h3>
            <p className="card-detail">Target: <code>{apiBaseUrl}/health</code></p>
            <div className="connection-info">
              {backendStatus.loading ? (
                <span className="status-text loading-text">Checking backend connection...</span>
              ) : backendStatus.connected ? (
                <div className="backend-meta">
                  <span className="status-text success-text">&check; Backend Online & Healthy</span>
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
          <h3>Architecture Highlights</h3>
          <ul className="arch-list">
            <li><strong>Root Isolation:</strong> Strict root containing only <code>client/</code>, <code>server/</code>, and <code>.gitignore</code>.</li>
            <li><strong>Modular Backend:</strong> Layered MVC architecture (Routes &rarr; Controllers &rarr; Services &rarr; Middlewares &rarr; Config).</li>
            <li><strong>Security First:</strong> Helmet security headers, CORS origin whitelist, standardized error and response wrappers.</li>
            <li><strong>Zero Hardcoded Secrets:</strong> Configured via environment variables with template definitions.</li>
          </ul>
        </div>
      </main>

      <footer className="footer">
        <p>SastoMarts Foundation &copy; {new Date().getFullYear()} &bull; Ready for next development phases</p>
      </footer>
    </div>
  );
}

export default App;
