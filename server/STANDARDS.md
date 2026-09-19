# Server Engineering & Coding Standards

---

## 1. Global JavaScript Only Rule
- The server codebase strictly uses **pure Node.js / Express JavaScript (ES Modules)**.
- Allowed file extensions: `.js`, `.mjs`, `.json`.
- Disallowed: TypeScript (`.ts`, `tsconfig.json`, TypeScript compilers).

---

## 2. Enterprise Coding Principles
1. **Maintainable Code**: Code is written primarily for human readability. Prefer explicit logic over cryptic one-liners.
2. **Clear Naming Conventions**:
   - Files: `camelCase.js` for utilities/configs, `[domain].[layer].js` for architecture files (e.g. `health.controller.js`, `health.service.js`).
   - Functions & Variables: `camelCase`.
   - Classes & Models: `PascalCase`.
   - Constants & Env Keys: `SCREAMING_SNAKE_CASE`.
3. **Small Focused Modules**: Keep files small (ideally under 150-200 lines) with a single, clearly defined responsibility.
4. **Separation of Concerns**: Controllers handle HTTP requests; services execute business logic; models manage data persistence.
5. **No Duplicated Business Logic**: All calculation formulas (e.g. INR to NPR conversion, landed cost formulas) must exist in exactly one place in `src/services/` or `src/utils/`.
6. **Consistent Error Handling**: Throw structured `ApiError` instances rather than generic errors.
7. **Secure Defaults**: Validate all inputs at the entry layer, sanitize queries, and never trust raw client input.
