# Server Architecture & Development Guide

## Layered Pipeline Flow
```text
HTTP Request
     ↓
Route Layer (routes/v1/*)
     ↓
Middleware Pipeline (Auth, RBAC, Validation, RateLimiter, Sanitizer)
     ↓
Controller Layer (controllers/*)
     ↓
Service Layer (services/*)
     ↓
Model / Database Layer (models/*)
     ↓
HTTP Standardized Response (ApiResponse / ApiError)
```

## Layer Responsibilities

### 1. Route Layer (`src/routes/`)
- Declares HTTP method endpoints and URL paths.
- Binds validation, authentication, and authorization middlewares.
- **Rule:** Never execute database queries or business calculations directly in route handlers.

### 2. Middleware Layer (`src/middlewares/`)
- Intercepts requests before reaching controllers.
- Responsibilities: JWT token verification (`auth`), role-based access control (`rbac`), rate limiting, NoSQL injection sanitization (`sanitizeInput`), request logging (`requestLogger`), 404 handler (`notFound`), and global error formatter (`errorHandler`).

### 3. Controller Layer (`src/controllers/`)
- Extracts request headers, query params, URL parameters, and body payloads.
- Invokes appropriate service methods.
- Formats and returns standardized HTTP responses via `BaseController` or `ApiResponse`.
- Uses `asyncHandler` to safely catch unhandled exceptions without repetitive try-catch blocks.

### 4. Service Layer (`src/services/`)
- Contains core domain business logic (e.g. quote pricing algorithms, tax/customs calculations, exchange rate peg conversions, order state machines).
- **Rule:** Must return pure JavaScript data/objects. Must never reference Express `req` or `res` objects.

### 5. Model Layer (`src/models/`) *(Future)*
- Defines schema structures, indexes, and persistence methods for MongoDB collections.

## Application Responsibility Boundaries

| System Layer | Core Responsibilities | Prohibited Actions |
| :--- | :--- | :--- |
| **Browser (Client)** | Render UI, capture interactions, manage local UI state, call REST API | Direct DB access, pricing authority, secret storage |
| **Server (API)** | Authentication, RBAC, validation, pricing authority, quote math, tax estimation, order state transitions | Trusting unvalidated client calculations, exposing stack traces |
| **Database (Data)** | Durable data persistence, indexed queries, relational document integrity | Direct exposure to public internet |

## Development Workflow for New Backend Endpoints
1. **Define Service Method:** Write business logic in `src/services/[domain].service.js`.
2. **Define Controller:** Handle `req`/`res` in `src/controllers/[domain].controller.js` using `asyncHandler`.
3. **Define Route:** Declare endpoint in `src/routes/v1/[domain].routes.js` and mount in `routes/v1/index.js`.
4. **Attach Middleware:** Attach `requireAuth` / `requireRole` where access control is needed.
