# Client JavaScript Coding Standards

## 1. Strict Technology Rule: Pure JavaScript Only
- **Extensions:** `.js` and `.jsx` exclusively.
- **Prohibited:** TypeScript (`.ts`, `.tsx`), `tsconfig.json`, TypeScript compilers, or `@types/*` packages.
- **Standard:** Modern ECMAScript (ES2022+) with native modules (`import`/`export`).

## 2. React Component Standards
- **Single Responsibility:** A component must focus on rendering UI and handling user events.
- **Composition over Inheritance:** Complex screens must compose smaller components (e.g. `App.jsx` composing `Header`, `StatusCard`, `FoundationHighlights`, `Footer`).
- **No Direct DB Access:** React must never query databases or access server-only resources.
- **Centralized API Calls:** Do not scatter `fetch()` across components. Use `healthService` and `http` from `@/services`.

## 3. State Management Standards
- **Intentional State:** Keep local state minimal. Derive values during render where possible.
- **No Heavy Redundant Libraries:** Use React built-in state (`useState`, `useEffect`, `useContext`) and custom hooks (`useLocalStorage`, `useDebounce`).

## 4. Naming Conventions
- **Components:** PascalCase (e.g. `MainLayout.jsx`, `StatusCard.jsx`).
- **Hooks:** camelCase with `use` prefix (e.g. `useDebounce.js`).
- **Services & Utils:** camelCase (e.g. `apiClient.js`, `currency.js`).
- **Constants:** UPPER_SNAKE_CASE (e.g. `APP_CONSTANTS`, `ROUTES`).
