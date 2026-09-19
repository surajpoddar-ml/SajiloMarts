# SastoMarts Backend (API Server)

SastoMarts API is the backend engine powering the India-to-Nepal cross-border e-commerce and product-sourcing platform.

---

## 1. Platform Purpose
The platform enables customers and businesses in Nepal to source and purchase products directly from major Indian marketplaces and suppliers with:
- Automated INR-to-NPR fixed peg currency calculations (1 INR = 1.6 NPR).
- Customs duty, service charges, and cross-border logistics estimation.
- Doorstep delivery across Nepal.
- Integrated payment gateways (eSewa, Khalti, Fonepay, Stripe).

---

## 2. Technology Stack
- **Runtime:** Node.js (v20+ / ES Modules)
- **Framework:** Express 4 (Strict JavaScript only)
- **Security:** Helmet, CORS Origin Whitelist, Rate Limiting, Input Sanitization
- **Logging:** Morgan (Environment-configurable)

---

## 3. Development Commands
```bash
# Navigate to server
cd server

# Install dependencies
npm install

# Start development server with live reload (nodemon)
npm run dev

# Start production server
npm start

# Run syntax/lint check
npm run lint
```

---

## 4. Documentation Index

The following architecture guides provide comprehensive details on every facet of the backend:

| Document | Description |
| :--- | :--- |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | Layered architecture, request flow, and domain boundaries |
| [`API.md`](./API.md) | Standard envelope format, existing endpoints, and planned domain routes |
| [`CONFIG.md`](./CONFIG.md) | Environment configuration, validation, and secret isolation |
| [`SECURITY.md`](./SECURITY.md) | Implemented and planned security principles |
| [`STANDARDS.md`](./STANDARDS.md) | JavaScript-only rule, naming conventions, and code hygiene |
| [`DATABASE.md`](./DATABASE.md) | MongoDB Atlas schema planning and lifecycle management |
| [`AUTH.md`](./AUTH.md) | JWT authentication and role-based access control planning |
| [`PAYMENTS.md`](./PAYMENTS.md) | Payment gateway architecture and webhook verification |
| [`WORKFLOW.md`](./WORKFLOW.md) | Git workflow, commit standards, and production principles |
| [`ROADMAP.md`](./ROADMAP.md) | 21-step sequential future implementation order |
