# Client Environment & Configuration Specification

---

## 1. Browser-Safe Public Configuration
Frontend environment variables are injected at build/runtime via Vite (`import.meta.env`). Only variables explicitly prefixed with `VITE_` are bundled into the client bundle.

> [!CAUTION]
> **Any value placed in `client/.env` is PUBLIC and accessible to anyone via browser Developer Tools.**
> Never place private API keys, payment secrets, database URIs, or private authentication tokens in the client application.

---

## 2. Client Environment Variables Table

| Variable Name | Required | Default / Example | Purpose |
| :--- | :--- | :--- | :--- |
| `VITE_NODE_ENV` | Optional | `development` | Active client runtime environment (`development`, `production`, `test`). |
| `VITE_API_BASE_URL` | Optional | `http://localhost:5000/api/v1` | Base URL for backend REST API endpoints. |
| `VITE_APP_TITLE` | Optional | `SastoMarts` | Brand display title. |
| `VITE_CURRENCY_SYMBOL` | Optional | `NPR` | Default UI currency code. |
| `VITE_ENABLE_MOCK_DATA` | Optional | `false` | Feature toggle for offline mock testing. |
| `VITE_ENABLE_ANALYTICS` | Optional | `false` | Client analytics tracking toggle. |

---

## 3. Centralized Accessor Pattern
Client code must never read `import.meta.env` directly in components. All environment access must flow through `src/config/env.js` and `src/config/features.js`.
