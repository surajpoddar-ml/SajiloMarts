# SastoMarts — Future Development Sequence & Roadmap

This document outlines the systematic, professional implementation roadmap for SastoMarts from the current foundational phase through production launch.

---

## 1. Sequence of Implementation

```
Foundational Layer (Prompts 1-7) — COMPLETED
   ↓
Phase 1: Persistence & Identity
1. Database Integration (MongoDB connection & lifecycle management)
2. Database Models & Schemas (Mongoose schemas & validation rules)
3. Authentication System (JWT access/refresh tokens, password hashing)
4. Authorization & RBAC (Role-based access control: customer, agent, admin)
5. User & Account Management (Profiles, addresses, KYC verification)
   ↓
Phase 2: Sourcing Engine & Catalog
6. Product & Category System (Catalog, variations, inventory tracking)
7. Marketplace URL Validation (SSRF-protected link scraping & normalization)
8. Sourcing Quote Engine (Real-time India-to-Nepal landed cost calculator)
   ↓
Phase 3: Commerce & Fulfillment
9. Cart & Saved Items (Persistent server-synced customer cart)
10. Checkout Flow (Address selection, customs documentation, delivery options)
11. Payment Gateways (eSewa, Khalti, Fonepay, Stripe, signature verification)
12. Orders Management (Order creation, state machine, lifecycle tracking)
13. Cross-Border Tracking (India hub to Nepal customs to local delivery)
14. Real-time Notifications (Email, SMS, WebSocket status updates)
   ↓
Phase 4: Operations & Growth
15. Admin & Operations Dashboard (Quote reviews, catalog management, financials)
16. Product Reviews & Ratings (Verified purchase reviews, moderation)
17. Promotions & Coupon System (Discounts, affiliate codes, referral rules)
18. Customer Support & Ticket System (Dispute resolution, inquiry management)
   ↓
Phase 5: Quality & Production
19. Security Hardening & Audit (Rate limiting, helmet, SSRF lockdown, audit logs)
20. Automated Testing Suite (Unit tests, integration tests, E2E flows)
21. Production Deployment & Cloudflare Setup (CI/CD, CDN, SSL, Atlas, monitoring)
```

---

## 2. Guiding Architectural Principles

- **Strict Isolation**: Each prompt focuses exclusively on its designated milestone.
- **No Early Assumptions**: Features are built only when their prerequisites are fully tested and stable.
- **JavaScript Only**: All code across all future stages will remain standard JavaScript (`.js`, `.jsx`).
- **Clean Root Constraint**: All future files will reside exclusively inside `client/` and `server/`.
