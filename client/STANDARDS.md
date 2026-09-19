# Client JavaScript Standards

## Technology Rules
- **Strictly JavaScript & JSX**: Use `.js` and `.jsx` extensions only. No TypeScript (`.ts`, `.tsx`).
- **Framework**: React 19 + Vite.

## Architecture Layers
`Page → Reusable Component → Hook / Service → API Client`

1. **Pages**: Route-level layout coordinators.
2. **Components**: UI presentation and interaction. Small, focused, single responsibility.
3. **Hooks**: Reusable stateful React logic.
4. **Services**: Centralized HTTP requests and backend communication.
5. **Utils**: Pure helper functions without UI or state dependencies.

## Coding Conventions
- **Components/Layouts**: PascalCase (`MainLayout.jsx`, `App.jsx`).
- **Hooks**: camelCase with `use` prefix (`useDebounce.js`, `useLocalStorage.js`).
- **Services/Utils**: camelCase (`health.service.js`, `currency.js`, `formatters.js`).
- **Constants**: UPPER_SNAKE_CASE (`ROUTES`, `API_ENDPOINTS`, `APP_CONSTANTS`).
