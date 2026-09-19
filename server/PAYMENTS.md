# SastoMarts — Payment Architecture & Gateway Planning

> **Status:** Architecture Design / Planned (Not Yet Implemented in Code)

---

## 1. Overview & Business Model

SastoMarts facilitates cross-border e-commerce and product sourcing between India and Nepal. Transactions must handle Nepal Rupees (NPR) as the primary base pricing currency while supporting Indian Rupee (INR) supplier cost conversions and international payment rails.

---

## 2. Planned Payment Gateways

| Gateway | Primary Region / Use Case | Protocol / Method |
| :--- | :--- | :--- |
| **eSewa** | Nepal Domestic | Redirect / EPAY API & Signature Verification |
| **Khalti** | Nepal Domestic | Khalti Payment Gateway (KPG) v2 Widget / Server Verification |
| **Fonepay / ConnectIPS**| Nepal Bank Interbank | QR Code & Direct Bank Transfer Gateway |
| **Stripe** | International Cards (Visa / Mastercard) | Stripe Elements / Payment Intents API |
| **Cash on Delivery (COD)**| Nepal Local Delivery | Restricted threshold with admin phone/SMS verification |

---

## 3. Server-Authoritative Payment Principles

1. **Client Never Dictates Amount**: The browser NEVER sends the payable amount to the payment gateway. The server calculates the exact order total (subtotal + customs duty + international shipping + tax - coupons) and signs the payment request payload.
2. **Idempotency**: All payment initialization and verification operations will use idempotent transaction tokens to prevent double billing.
3. **Webhook Verification**: Payment gateways will notify SastoMarts via server-to-server webhooks. All incoming webhooks must verify HMAC signatures using secret keys stored strictly in private environment variables.
4. **State Machine**: Order payment status follows a strict lifecycle:
   - `PENDING` → `PROCESSING` → `COMPLETED` / `FAILED` / `REFUNDED`
5. **Audit Trail**: Every payment attempt, gateway response, webhook log, and status transition is recorded in an immutable payment transaction collection.

---

## 4. Planned Architecture & File Layout

When payment integration is scheduled in a future prompt, it will follow this module layout:

```text
server/src/
├── integrations/
│   ├── esewa/          # eSewa API client & signature generator
│   ├── khalti/         # Khalti v2 API client & verification
│   └── stripe/         # Stripe SDK wrapper & webhook parser
├── services/
│   ├── payment.service.js   # Orchestrates payment initialization and callback processing
├── controllers/
│   └── payment.controller.js # Handles client initiation & webhook endpoints
├── routes/v1/
│   └── payment.routes.js     # /api/v1/payments (initiate, verify, webhook)
```

---

## 5. Security & Compliance Checklist

- [ ] Private API keys & secret hashes stored strictly in private `.env`
- [ ] Webhook endpoints configured with raw body parser for accurate HMAC calculation
- [ ] TLS 1.3 encryption for all gateway communication
- [ ] No cardholder PAN or CVV stored in SastoMarts database (PCI-DSS compliance via tokenization)
