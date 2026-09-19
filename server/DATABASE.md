# Database Architecture & Entity Planning Guide

> **Current Status:** Architecture & Design Phase (MongoDB and Mongoose are NOT yet connected or instantiated).

---

## 1. Planned Technology Stack
- **Database Engine:** MongoDB 7.0+ (MongoDB Atlas Multi-AZ cluster)
- **Object Data Modeling (ODM):** Mongoose (Strict JavaScript Schemas)
- **Lifecycle Management:** Connection pool singleton with automatic reconnection and graceful shutdown on `SIGINT`/`SIGTERM`.

---

## 2. Planned Domain Entities Blueprint

| Entity / Collection | Primary Role & Purpose | Key Planned Fields |
| :--- | :--- | :--- |
| **`User`** | Customer & staff identity profiles, auth credentials, KYC status. | `name`, `email`, `passwordHash`, `phone`, `role` (`customer`/`agent`/`admin`), `isVerified`, `isActive`. |
| **`Address`** | Nepal delivery locations and Indian sourcing warehouse hubs. | `userId`, `recipientName`, `phone`, `province`, `district`, `city`, `streetAddress`, `isDefault`. |
| **`Category`** | Taxonomy hierarchy for catalog navigation and customs duty mapping. | `name`, `slug`, `parentId`, `customsDutyRate`, `iconUrl`, `isActive`. |
| **`Product`** | Curated Indian marketplace catalog cache with localized pricing. | `title`, `sourceUrl`, `sourcePlatform`, `priceInr`, `priceNpr`, `categoryId`, `images`, `stockStatus`. |
| **`Quote`** | Sourcing requests initiated by users submitting external marketplace links. | `userId`, `sourceUrl`, `estimatedInr`, `landedNpr`, `customsFee`, `logisticsFee`, `status` (`PENDING`/`APPROVED`/`REJECTED`). |
| **`Order`** | Final customer purchase orders containing cross-border item bundles. | `orderNumber`, `userId`, `items`, `shippingAddressId`, `subtotalNpr`, `customsDutyNpr`, `totalNpr`, `orderStatus`. |
| **`Payment`** | Payment transaction records and gateway audit trails. | `orderId`, `gateway` (`esewa`/`khalti`/`fonepay`/`stripe`), `transactionRef`, `amountNpr`, `status` (`INITIATED`/`SUCCESS`/`FAILED`). |
| **`Review`** | Verified customer reviews and ratings on sourced products. | `userId`, `productId`, `orderId`, `rating` (1-5), `comment`, `images`, `isVerifiedPurchase`. |
| **`Coupon`** | Promotional discount codes and referral discounts. | `code`, `discountType` (`PERCENTAGE`/`FLAT`), `discountValue`, `minOrderAmount`, `expiresAt`, `usageCount`. |
| **`AuditLog`** | Immutable security trail for privileged administrative operations. | `actorId`, `action`, `targetResource`, `ipAddress`, `userAgent`, `metadata`, `createdAt`. |

---

## 3. Indexing & Data Integrity Strategies
1. **Compound Indexing**: Frequently queried compound keys (e.g. `{ userId: 1, createdAt: -1 }` on `Order` and `Quote`) will be indexed for fast retrieval.
2. **Unique Constraints**: Unique indexes on `User.email`, `Order.orderNumber`, `Coupon.code`, and `Category.slug`.
3. **Soft Deletes**: Key records (`User`, `Product`, `Order`) will use soft-deletion flags (`deletedAt`) to preserve historical audit integrity.

---

## 4. Entity Relationships & Document Flow
```text
User (1) ─── has many ───> Address (N)
User (1) ─── requests ───> Quote (N)
User (1) ─── places ─────> Order (N) ─── has one ───> Payment (1)
                                      └── has many ──> Review (N)
Category (1) ─── categorizes ───> Product (N)
```
- **Embedding vs Referencing**: High-cardinality items (e.g. `Order.items`) are embedded as sub-documents with snapshot pricing to preserve historical integrity even if base product catalog prices change.
