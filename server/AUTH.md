# Authentication & Authorization Planning Guide

> **Current Status:** Planned for future prompt. Authentication is NOT currently implemented in the active codebase.

## Planned Authentication Architecture
1. **Password Security:** Passwords hashed with bcrypt (salt rounds: 10) before persisting to database.
2. **Access Tokens:** Short-lived JSON Web Tokens (15-minute expiry) passed in the `Authorization: Bearer <token>` header.
3. **Refresh Tokens:** Long-lived tokens (7-day expiry) stored securely for session renewal.
4. **Token Revocation:** Database or Redis blacklist checking for invalidated refresh tokens.

## Planned Authorization (RBAC) Architecture
- **Roles:**
  - `customer`: Default role. Can view catalog, request quotes, manage own cart, checkout, view own orders.
  - `vendor`: Can manage inventory and fulfill allocated sourcing items.
  - `sourcing_agent`: Can evaluate sourcing quotes, verify Indian marketplace prices, and input customs calculations.
  - `admin`: Full system access, pricing overrides, audit logs, and user management.
- **Middleware Guard:** `requireAuth` verifies token validity; `requireRole(...allowedRoles)` enforces role permissions before controller execution.
