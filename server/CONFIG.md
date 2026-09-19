# Server Environment & Configuration Specification

---

## 1. Environment Architecture & Safety
The SastoMarts backend employs strict environment validation via `src/config/env.js`. Upon boot, all critical variables are validated and sanitized. If any required production variable is missing or malformed, the server fails fast with a descriptive initialization error.

---

## 2. Server Environment Variables Specification

| Variable Name | Environment Scope | Required in Prod | Default Value | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `NODE_ENV` | Global | **Yes** | `development` | Runtime environment (`development`, `production`, `test`). |
| `PORT` | Global | **Yes** | `5000` | HTTP port for the Express server. |
| `CLIENT_ORIGIN` | CORS / Security | **Yes** | `http://localhost:5173` | Allowed frontend origin for CORS whitelist. |
| `DATABASE_URL` | *Planned / Private* | **Yes (Future)** | *None* | MongoDB Atlas connection connection string. |
| `JWT_SECRET` | *Planned / Private* | **Yes (Future)** | *None* | 256-bit secret key for signing auth tokens. |
| `JWT_EXPIRES_IN`| *Planned / Private* | Optional | `7d` | Access token time-to-live duration. |
| `ESEWA_MERCHANT_CODE` | *Planned / Private* | Optional | *None* | eSewa merchant identifier for Nepal payments. |
| `KHALTI_SECRET_KEY` | *Planned / Private* | Optional | *None* | Khalti v2 secret key for payment verification. |

---

## 3. Strict Secrets Management Rules
1. **Never Commit Secrets**: Real credentials, production passwords, and private API keys must never be committed to Git.
2. **Environment File Hygiene**: `.env` and `.env.local` files are strictly gitignored in `.gitignore`.
3. **Template Preservation**: Safe, dummy-value templates are provided in `.env.example` for onboarding developers.
4. **Centralized Config Import**: Application code must never access `process.env` directly; import `envConfig` from `src/config/index.js`.
