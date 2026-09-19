# Server JavaScript Coding Standards

## 1. Strict Technology Rule: Pure JavaScript Only
- **Extensions:** `.js` exclusively.
- **Prohibited:** TypeScript (`.ts`, `.tsx`), `tsconfig.json`, TypeScript compilers, or TypeScript type definitions.
- **Module System:** Node.js native ES Modules (`"type": "module"` in `package.json`).

## 2. Server Coding Conventions
- **Clean Naming:**
  - Controllers: `[domain].controller.js` (e.g. `health.controller.js`).
  - Services: `[domain].service.js` (e.g. `health.service.js`).
  - Routes: `[domain].routes.js` (e.g. `auth.routes.js`).
  - Middlewares: `[purpose].middleware.js` (e.g. `errorHandler.middleware.js`).
  - Config: `[domain].js` (e.g. `database.js`, `cors.js`).
- **Async/Await Standard:**
  - Use `async`/`await` consistently. Wrap controller endpoints with `asyncHandler`.
  - Never leave unhandled rejected promises.
- **Explicit Error Handling:**
  - Use custom error classes (`BadRequestError`, `UnauthorizedError`, `ForbiddenError`, `NotFoundError`, `ValidationError`, `ConfigError`).
  - Never silence errors with empty `catch (err) {}` blocks.
