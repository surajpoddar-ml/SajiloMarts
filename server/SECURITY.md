# Security Architecture & Principles

## Currently Implemented Controls
1. **HTTP Security Headers:** Implemented via `helmet` in Express application pipeline.
2. **Strict CORS Whitelist:** Restricted to authorized client origin (`CLIENT_URL`) with credential handling.
3. **NoSQL Injection Sanitization:** `sanitizeInput` middleware strips dangerous query keys (`$` and `.`) from incoming request bodies.
4. **IP Rate Limiting:** `apiRateLimiter` enforces request quotas per IP.
5. **Masked Error Responses:** `errorHandler` suppresses internal stack traces in production.
6. **Zero Secrets in Git:** Strict `.gitignore` protecting all environment files.

## Planned Future Security Controls
1. **Password Security:** Mandatory bcrypt/argon2 password hashing (minimum 10 salt rounds). Plaintext passwords must never be stored.
2. **Authentication & RBAC:** JWT bearer verification with short-lived access tokens (15m) and secure refresh tokens (7d). Separate authentication from role-based authorization (`CUSTOMER`, `ADMIN`, `VENDOR`, `SOURCING_AGENT`).
3. **SSRF Protection:** Product URL scraper and quote engine must validate and whitelist marketplace domains (e.g. Amazon.in, Flipkart.com, Meesho.com) before dispatching server-side requests.
4. **Payment Webhook Verification:** Cryptographic HMAC signature verification on all incoming webhook notifications from payment gateways before transitioning order status.
5. **Administrative Audit Logging:** Immutable audit logs capturing administrative actions, price overrides, and manual quotation approvals.
