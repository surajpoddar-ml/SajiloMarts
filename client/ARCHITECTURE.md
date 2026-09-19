# Client Architecture

## Architectural Flow
```text
React Page (Route View)
      ↓
Reusable UI Components (common / layout / feedback / forms)
      ↓
Custom Hooks / Services Layer (http, healthService, storage)
      ↓
Backend REST API (/api/v1/*)
```

## Folder Responsibilities

### `src/components/`
- **`common/`**: Reusable primitive UI elements (Buttons, Inputs, StatusCards, Badges, Modals). Focused strictly on presentation and user interaction.
- **`layout/`**: Structural layout components (Header, Footer, Navigation Bar, Sidebar).
- **`feedback/`**: Notification toasts, alert banners, loading spinners, skeleton placeholders.
- **`forms/`**: Input fields, search bars, filter groups, validation feedback wrappers.

### `src/pages/`
Route-level components that compose reusable components together to form complete views (Home, Shop, Quotes, Cart, Checkout, Orders, Account, Admin).

### `src/services/`
The centralized network layer:
- `apiClient.js`: Low-level fetch wrapper with bearer token injection and error interception.
- `http.js`: High-level convenience methods (`http.get`, `http.post`, `http.put`, `http.patch`, `http.delete`).
- `health.service.js`: Domain-specific API service modules.

### `src/hooks/`
Reusable stateful logic (e.g., `useDebounce`, `useLocalStorage`, `useMediaQuery`).

### `src/config/`
Public client configuration, environment flag readers (`env.js`), public feature toggles (`features.js`), and branding definitions (`public.js`).

### `src/constants/`
System constants including route paths (`routes.js`), endpoint URIs (`apiEndpoints.js`), and app storage keys (`appConstants.js`).

### `src/utils/`
Pure utility functions (currency conversions, date formatters, phone validators, local storage managers).
