# SastoMarts API Conventions & Specifications

---

## 1. API Versioning & Base URI
All REST endpoints are namespaced under the `/api/v1/` prefix:
```text
http(s)://<hostname>:<port>/api/v1/<domain>
```

---

## 2. Standardized JSON Envelopes

### Success Envelope (`ApiResponse`)
All successful API responses return a consistent envelope structure:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Resource retrieved successfully",
  "data": { ... },
  "timestamp": "2026-09-20T01:00:00.000Z"
}
```

### Error Envelope (`ApiError`)
All failed requests return a secure, standardized error payload:
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Invalid request payload",
  "errors": [
    { "field": "email", "message": "Email address must be a valid format" }
  ],
  "timestamp": "2026-09-20T01:00:00.000Z"
}
```
*Note: Stack traces are strictly suppressed in production environments.*

---

## 3. Standard HTTP Status Codes

| Code | Label | Meaning & Usage |
| :--- | :--- | :--- |
| **200** | OK | Standard successful response for GET, PUT, PATCH requests. |
| **201** | Created | Resource successfully created (POST). |
| **400** | Bad Request | Malformed request body or missing required parameters. |
| **401** | Unauthorized | Missing or expired authentication token. |
| **403** | Forbidden | Authenticated user lacks required permissions / roles. |
| **404** | Not Found | Requested resource URI or database ID does not exist. |
| **409** | Conflict | Duplicate entry (e.g. email already registered). |
| **422** | Unprocessable Entity | Validation rule failures (e.g. password too weak). |
| **429** | Too Many Requests | Rate limit exceeded. |
| **500** | Internal Server Error | Unexpected server exception (logged internally, sanitized for client). |

---

## 4. Pagination, Filtering & Sorting Planning (Future)

For collection queries (`/products`, `/orders`, `/quotes`), standard query parameters will be supported:
```text
GET /api/v1/products?page=1&limit=20&sort=-createdAt&category=electronics&minPrice=1000
```
Standardized pagination metadata will be included in the envelope:
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "items": [ ... ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "totalItems": 150,
      "totalPages": 8,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```
