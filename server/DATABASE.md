# Database Architecture & Planning Guide

> **Current Status:** Planned for future prompt. MongoDB and Mongoose are NOT currently connected or installed in the active codebase.

## Planned Technology
- **Database Engine:** MongoDB (via MongoDB Atlas or local instance)
- **ODM:** Mongoose (Pure JavaScript schemas)

## Planned Collection Schemas
1. **`users`**: Authentication credentials, profile details, saved addresses, role (`customer`, `admin`, `vendor`, `sourcing_agent`).
2. **`products`**: Sourced Indian catalog data, original INR price, category ID, images, descriptions.
3. **`quotes`**: User-submitted sourcing URL requests, estimated INR prices, converted NPR costs, customs fees, service fees, quote status (`pending`, `quoted`, `accepted`, `rejected`, `ordered`).
4. **`orders`**: Customer order items, delivery addresses in Nepal, shipping fee, tax breakdown, final NPR total, status tracking.
5. **`payments`**: Payment transaction logs, gateway identifier (`esewa`, `khalti`, `fonepay`, `stripe`), reference IDs, verification signatures, payment status.
6. **`categories`**: E-commerce catalog taxonomy hierarchy.
7. **`coupons`**: Discount promo codes, percentage/fixed deductions, expiration timestamps, usage limits.
8. **`audit_logs`**: Administrative audit trail recording privileged configuration changes and price overrides.

## Schema Design Rules
- Always define compound indexes on frequently queried fields (e.g. `userId` + `createdAt`).
- Enforce schema-level field validation and defaults.
- Always validate ObjectIds before executing database queries to prevent invalid query cast errors.
