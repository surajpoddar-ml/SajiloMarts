# Client Configuration Guide

## Public Environment Variables

| Variable | Scope | Type | Default (Dev) | Description |
| :--- | :--- | :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Public | String | `http://localhost:5000/api/v1` | Backend REST API endpoint URL |

> **Security Warning:** Any variable bundled into the client build (Vite `VITE_*`) is public and accessible in browser sources. Never store database credentials, private API keys, or JWT secrets in client environment files.

## Application Settings

- Public feature flags are maintained in `src/config/features.js`.
- Public branding tokens are maintained in `src/config/public.js`.
- Request timeouts and pagination are maintained in `src/config/app.js`.
