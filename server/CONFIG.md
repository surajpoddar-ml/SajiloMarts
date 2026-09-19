# Server Configuration Guide

## Environment Variables Overview

| Variable | Scope | Type | Default (Dev) | Description |
| :--- | :--- | :--- | :--- | :--- |
| `NODE_ENV` | Private | String | `development` | Runtime environment (`development`, `test`, `production`) |
| `PORT` | Private | Number | `5000` | Port for Express HTTP listener |
| `CLIENT_URL` | Private | String | `http://localhost:5173` | Allowed frontend origin for CORS whitelist |
| `SERVER_URL` | Private | String | `http://localhost:5000` | Server canonical URL |
| `API_PREFIX` | Private | String | `/api/v1` | Versioned API route prefix |
| `MONGODB_URI` | Private | String | `mongodb://localhost:27017/sastomarts` | Future MongoDB connection URI |
| `JWT_SECRET` | Private | String | *(Dev placeholder)* | Future JWT signature secret |
| `EMAIL_FROM` | Private | String | `noreply@sastomarts.com` | Outgoing system sender email |
| `SMTP_HOST` | Private | String | `smtp.mailtrap.io` | SMTP server host |
| `SMTP_PORT` | Private | Number | `2525` | SMTP server port |

## Validation & Startup Behavior
- `validateEnvironment()` is invoked on bootstrap in `server.js`.
- If required variables fail validation, startup aborts immediately with a structured `ConfigError`.
- No secret values are ever output to terminal logs or error responses.
