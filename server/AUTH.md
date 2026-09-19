# Authentication & Access Control Architecture Strategy

> **Current Status:** Architecture & Design Phase (Auth is NOT yet implemented in code).

---

## 1. Authentication Lifecycle & Token Strategy

```text
User Registration / Login Request
      ↓
Password Hashing / Comparison (bcrypt work factor 12)
      ↓
JWT Access Token (15 min TTL) + Secure Refresh Token (7 days TTL)
      ↓
Access Token returned in JSON response payload
Refresh Token stored in Secure, httpOnly, SameSite=Strict Cookie
      ↓
Authenticated API Requests (Bearer Token header in client services)
      ↓
Auth Middleware Verification (Decodes payload, verifies signature, hydrates req.user)
```

---

## 2. Security Controls & Credential Safety
1. **Zero Plaintext Passwords**: Passwords hashed using bcrypt with salt rounds 12 prior to database storage.
2. **Token Rotation**: Each refresh request issues a new refresh token and invalidates the previous one to detect token theft.
3. **Session Revocation**: User logout or password reset clears the refresh token cookie and blacklists active session IDs.
4. **Password Reset Flow**: Time-limited (15-minute), cryptographically signed single-use reset tokens dispatched via email.

---

## 3. Role-Based Access Control (RBAC) Strategy

| Role | Access Permissions |
| :--- | :--- |
| **`customer`** | Search products, submit quote URLs, manage cart, checkout, view own orders and tracking. |
| **`sourcing_agent`** | Review pending Indian marketplace quote requests, adjust logistics rates, verify supplier links. |
| **`admin`** | Full platform management: user administration, pricing overrides, financial analytics, audit logs. |

---

## 4. Planned Middleware Pipeline
- `authenticate`: Extracts Bearer token, validates cryptographic signature using `JWT_SECRET`, checks token expiration, and attaches `req.user`.
- `authorize(...roles)`: Verifies if `req.user.role` matches allowed roles for the targeted route; returns HTTP 403 Forbidden on mismatch.
