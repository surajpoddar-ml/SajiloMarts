# SastoMarts REST API Documentation (v1)

## Base URL
- **Development:** `http://localhost:5000/api/v1`
- **Root Ping:** `http://localhost:5000/`

## Domain Routes Status

| Route Path | Domain | Status | Description |
| :--- | :--- | :--- | :--- |
| `/api/v1/health` | Health | **Active** | System uptime and health metrics |
| `/api/v1/auth` | Authentication | *Planned* | User registration, login, token refresh, logout |
| `/api/v1/users` | Users | *Planned* | Customer profile, addresses, user preferences |
| `/api/v1/products` | Products | *Planned* | Indian catalog listing, details, marketplace sync |
| `/api/v1/categories`| Categories | *Planned* | Product taxonomy and navigation trees |
| `/api/v1/quotes` | Quotes | *Planned* | Sourcing quote requests, duty/tax estimates |
| `/api/v1/cart` | Cart | *Planned* | User shopping cart synchronization |
| `/api/v1/checkout` | Checkout | *Planned* | Cross-border address & delivery checkout |
| `/api/v1/orders` | Orders | *Planned* | Order creation, tracking, status transitions |
| `/api/v1/payments` | Payments | *Planned* | eSewa, Khalti, Fonepay, Stripe transactions |
| `/api/v1/shipping` | Shipping | *Planned* | Logistics tracking, Nepal hub transfers |
| `/api/v1/reviews` | Reviews | *Planned* | Verified customer feedback and ratings |
| `/api/v1/coupons` | Coupons | *Planned* | Promotional discount codes and campaigns |
| `/api/v1/notifications`| Alerts | *Planned* | Push, SMS, and email alerts |
| `/api/v1/admin` | Admin | *Planned* | Administrative controls and reporting |

## Standard Success Envelope
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation completed successfully",
  "data": { ... },
  "timestamp": "2026-09-20T00:00:00.000Z"
}
```

## Standard Error Envelope
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [ ... ],
  "timestamp": "2026-09-20T00:00:00.000Z"
}
```
