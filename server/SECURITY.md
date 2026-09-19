# SastoMarts Security Architecture & Guidelines

---

## 1. Security Baseline & Implementation Matrix

| Security Control | Domain | Status | Description |
| :--- | :--- | :--- | :--- |
| **HTTP Security Headers** | Infrastructure | **Implemented** | Helmet integration configuring HSTS, X-Content-Type-Options, X-Frame-Options, CSP. |
| **CORS Whitelist** | Transport | **Implemented** | Strict origin validation restricting API access to authorized frontend domains. |
| **Body Size Limits** | Transport | **Implemented** | Express JSON and URL-encoded body limit set to 10kb to mitigate DoS buffer attacks. |
| **Input Sanitization** | Transport | **Implemented** | Stripping malicious tags and characters across query parameters and bodies. |
| **Safe Error Handling** | Application | **Implemented** | Production error handler suppresses internal stack traces and database errors. |
| **Password Hashing** | Identity | *Required in Prod* | Salted bcrypt (work factor 12) for all user credentials. |
| **JWT Token Rotation** | Identity | *Required in Prod* | Short-lived access tokens (15m) paired with rotating refresh tokens stored in httpOnly cookies. |
| **Role-Based Access Control** | Authorization | *Required in Prod* | Granular RBAC (`admin`, `agent`, `customer`) enforced at the middleware layer. |
| **Rate Limiting** | Infrastructure | *Required in Prod* | IP-based request throttling against auth brute-force and DDoS attempts. |
| **SSRF Protection** | Sourcing | *Required in Prod* | Whitelist-only URL resolution for Indian marketplace scraping (blocking localhost/private IPs). |
| **Webhook HMAC Verification**| Payments | *Required in Prod* | Cryptographic signature validation for eSewa, Khalti, and Stripe webhooks. |
| **Admin Audit Trail** | Compliance | *Required in Prod* | Tamper-evident logging of administrative actions, quote overrides, and manual refunds. |

---

## 2. Core Security Invariants
1. **Never Commit Secrets**: Real credentials must never exist in repository code or commit history.
2. **Never Trust the Client**: All prices, discount percentages, exchange rates, and permissions must be computed and verified by the server.
3. **No Direct Database Exposure**: Database ports are firewalled from the public internet; all data queries originate strictly from the backend server.
4. **Least Privilege Principle**: API services and database users will operate with the minimal permissions required for their specific function.
