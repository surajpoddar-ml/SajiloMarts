# SastoMarts — Payment Architecture & Gateway Planning Guide

> **Status:** Architecture Design / Planned (Not Yet Implemented in Code)

---

## 1. Cross-Border Financial Flow & Currency Peg
SastoMarts facilitates cross-border e-commerce and product sourcing between India and Nepal:
- **Base Sourcing Currency:** Indian Rupee (INR).
- **Customer Facing Currency:** Nepali Rupee (NPR).
- **Official Pegged Rate:** `1 INR = 1.60 NPR`.
- **Landed Cost Breakdown:**
  $$\text{Landed Cost (NPR)} = (\text{Supplier INR} \times 1.60) + \text{Customs Duty} + \text{Cross-Border Freight} + \text{Service Fee} + \text{Nepal VAT/Taxes}$$

---

## 2. Planned Payment Gateways & Integration Protocols

| Gateway | Primary Region / Method | Integration Protocol |
| :--- | :--- | :--- |
| **eSewa** | Nepal Domestic Wallet | eSewa EPAY v2 API (HMAC SHA-256 signature payload & redirect callback). |
| **Khalti** | Nepal Domestic Wallet / Banking | Khalti Payment Gateway (KPG) v2 API (Server-to-Server `/epayment/lookup/` verification). |
| **Fonepay / ConnectIPS**| Nepal Interbank | Direct Interbank QR & Gateway API with cryptographic checksum verification. |
| **Bank Transfer** | Nepal Corporate / High-Value | Manual slip upload + Admin manual reconciliation with dual verification. |
| **Cash on Delivery (COD)**| Nepal Domestic Local | Restricted to low-risk verified accounts with SMS confirmation. |
| **Stripe** | International Visa / Mastercard | Stripe PaymentIntents API with webhook event signatures. |

---

## 3. Server-Authoritative Financial Principles

1. **Client Never Dictates Payable Amount**: The browser client **never** sends payable amounts to gateways. The backend server computes the exact order total and issues cryptographically signed payment initialization tokens.
2. **Idempotency**: Every payment attempt generates a unique UUID `transactionToken` to prevent accidental double-charges.
3. **Webhook Verification**: Inbound webhooks must verify HMAC signatures using private secrets stored in `.env`.
4. **Payment State Machine**:
   ```text
   INITIATED → PROCESSING → COMPLETED
                          ↘ FAILED / EXPIRED / REFUNDED
   ```
5. **Immutable Audit Trail**: All gateway requests, raw payloads, IP addresses, and response codes are stored in the database for compliance.

---

## 4. Gateway Verification & Webhook Handling Protocol

### eSewa EPAY v2 Signature Flow
- Payload parameters: `total_amount`, `transaction_uuid`, `product_code`.
- Signature generated via HMAC-SHA256 using `ESEWA_SECRET_KEY`.
- On callback, backend validates signature before transitioning order to `PAID`.

### Khalti v2 Server Verification Flow
- Client triggers KPG widget and receives `pidx` token.
- Server invokes `POST https://khalti.com/api/v2/epayment/lookup/` with `Authorization: Key <secret_key>` and verifies status `Completed`.
- Server marks order `PAID` only upon verified lookup response.
