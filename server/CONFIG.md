# Server Configuration Guide

## Environment Variables

| Variable | Scope | Type | Default (Dev) | Description |
| :--- | :--- | :--- | :--- | :--- |
| `NODE_ENV` | Private | String | `development` | Application runtime environment (`development`, `test`, `production`) |
| `PORT` | Private | Number | `5000` | Port for Express HTTP listener |
| `CLIENT_URL` | Private | String | `http://localhost:5173` | Allowed frontend origin for CORS policies |
| `SERVER_URL` | Private | String | `http://localhost:5000` | Base URL for server self-reference |
| `API_PREFIX` | Private | String | `/api/v1` | Prefix for versioned REST routes |
| `MONGODB_URI` | Private | String | `mongodb://localhost:27017/sastomarts` | Database connection string placeholder |
| `JWT_SECRET` | Private | String | *(Dev placeholder)* | Signing secret for authentication tokens |
| `EMAIL_FROM` | Private | String | `noreply@sastomarts.com` | Outgoing system sender email |
| `SMTP_HOST` | Private | String | `smtp.mailtrap.io` | SMTP server host |
| `SMTP_PORT` | Private | Number | `2525` | SMTP server port |

## Validation Rules

- `PORT` must be between 1 and 65535.
- `NODE_ENV` must be one of `development`, `test`, `production`.
- `CLIENT_URL` must start with `http://` or `https://`.
- In production, real secrets must be provided via deployment environment variables.
