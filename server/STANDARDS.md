# Server JavaScript Standards

## Technology Rules
- **Strictly JavaScript (ES Modules)**: Use `.js` extension only. No TypeScript.
- **Node.js**: Native async/await, modern ES2022+ features.

## Architecture Layers
`Route → Middleware → Controller → Service → Model/Database`

1. **Routes**: Define paths and bind middlewares. No business logic or database queries.
2. **Middlewares**: Cross-cutting concerns (Auth, RBAC, Validation, Sanitization, Rate Limiting, Error Handling).
3. **Controllers**: Parse input, call services, return `ApiResponse`. No direct DB queries.
4. **Services**: Pure business logic. Must return pure data/objects and never reference Express `req`/`res`.
5. **Models**: Schema definitions and persistence queries.

## Coding Conventions
- **Files**: camelCase for utils/middlewares/services (`auth.middleware.js`, `health.service.js`).
- **Classes**: PascalCase (`ApiResponse`, `ApiError`, `ConfigError`).
- **Constants**: UPPER_SNAKE_CASE (`HTTP_STATUS`, `USER_ROLES`).
- **Functions**: camelCase with verb prefixes (`getHealthStatus`, `validateEnvironment`).
