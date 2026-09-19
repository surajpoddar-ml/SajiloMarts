# Server Architecture & Engineering Guidelines

---

## 1. Layered Pipeline Flow
```text
HTTP Request
     ↓
Route Layer (src/routes/v1/*)
     ↓
Middleware Pipeline (Auth, RBAC, Validation, RateLimiter, Sanitizer, Logger)
     ↓
Controller Layer (src/controllers/*)
     ↓
Service Layer (src/services/*)
     ↓
Model / Database Layer (src/models/*) [Planned]
     ↓
HTTP Standardized Response (ApiResponse / ApiError)
```

---

## 2. Layer Responsibilities & Architectural Boundaries

### 1. Routes (`src/routes/`)
- **Responsibility:** Declares URL paths, HTTP methods (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`), and endpoint grouping.
- **Middleware Binding:** Binds authentication guards, validation schemas, and rate limiters to specific endpoints.
- **Strict Prohibition:** Route files must **never** execute database operations, perform calculations, or format custom response bodies directly.

### 2. Middleware (`src/middlewares/`)
- **Responsibility:** Handles cross-cutting HTTP request concerns before controllers execute.
- **Implemented Now:**
  - `errorHandler.js`: Global exception catcher returning standardized error responses without leaking stack traces in production.
  - `notFound.js`: Standard 404 handler for unrecognized paths.
  - `asyncHandler.js`: Higher-order function wrapping async route handlers to eliminate repetitive try-catch blocks.
  - `security.js` / Helmet / CORS: Request sanitization, origin whitelisting, and secure response headers.
- **Planned for Future Prompts:**
  - `auth.middleware.js`: JWT token extraction, signature verification, and user session hydration.
  - `rbac.middleware.js`: Role-based access control checking (`admin`, `staff`, `customer`).
  - `validation.middleware.js`: Request payload validation against strict schemas.
  - `rateLimiter.js`: Redis/in-memory rate limiting against brute force and DDoS.

### 3. Controllers (`src/controllers/`)
- **Responsibility:** HTTP orchestrators that:
  1. Extract parameters from `req.body`, `req.query`, `req.params`, and `req.user`.
  2. Invoke domain service methods with clean JavaScript arguments.
  3. Format and dispatch standardized HTTP responses via `ApiResponse`.
- **Strict Prohibition:** Controllers must not contain complex business calculations, pricing logic, or direct database queries.

### 4. Services (`src/services/`)
- **Responsibility:** The core business logic layer containing pure domain rules:
  - Landed cost quote math (INR to NPR conversion, Nepal customs duty rates, freight fees).
  - Order state machine transitions and validation.
  - Payment initiation and webhook signature verification.
  - External marketplace scraping and link normalization.
- **Strict Prohibition:** Services must remain completely decoupled from the HTTP transport layer. They must **never** reference Express `req`, `res`, or `next` objects.

### 5. Model / Database Layer (`src/models/`) — *Planned*
- **Responsibility:** Defines Mongoose schemas, data types, indexes, relational references, and validation rules for persistent MongoDB collections.
- **Strict Prohibition:** Models must not be accessed directly by controllers. All database interactions will flow through domain services.

---

## 3. Server Request Lifecycle & Authoritative Execution Flow

```text
Incoming HTTP Request
      ↓
Route Matching (/api/v1/<domain>)
      ↓
Security Middleware (Helmet, CORS validation, Rate limiting)
      ↓
Authentication & RBAC Middleware (Extract JWT, verify signature, hydrate user role)
      ↓
Input Validation Middleware (Schema validation on req.body, req.query, req.params)
      ↓
Controller Orchestration (Extract clean parameters, invoke domain service)
      ↓
Domain Service Business Logic (Authoritative calculations: landed cost, peg rate, order total)
      ↓
Database / External API Layer (MongoDB queries via Mongoose / gateway webhooks)
      ↓
Response Formatting (Dispatched via ApiResponse envelope with HTTP status)
```

---

## 4. Application Boundary Matrix

> [!IMPORTANT]
> **Core Architectural Principle:** The backend server is strictly authoritative for business rules, calculations, permissions, and security-sensitive decisions.

| System Layer | Core Responsibilities | Prohibited Actions |
| :--- | :--- | :--- |
| **Frontend (Browser)** | • Rendering interactive UI components<br>• Capturing user inputs & feedback<br>• Local form validation (UX only)<br>• Managing client presentation state<br>• Communicating via REST API | • Direct database connections<br>• Determining prices or currency rates<br>• Deciding user permissions or roles<br>• Verifying payment transactions<br>• Storing private API keys / secrets |
| **Backend (Express API)** | • Authentication & RBAC enforcement<br>• Pricing, customs duty, & quote math<br>• Order totals, discounts, & coupons<br>• Payment initiation & webhook verification<br>• Database queries via Mongoose<br>• Error sanitization & audit logging | • Trusting unverified client totals<br>• Exposing internal stack traces<br>• Bypassing input validation layers<br>• Committing plaintext secrets |
| **Database (MongoDB)** | • Durable document persistence<br>• Unique index constraints & relationships<br>• Atomic document updates<br>• Audit trail preservation | • Public internet exposure<br>• Unauthenticated connections |
