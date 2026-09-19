# Client Architecture & Engineering Guidelines

---

## 1. Architectural Flow
```text
React Page (Route View)
      ↓
Reusable UI Components (common / layout / feedback / forms)
      ↓
Custom Hooks / Client State
      ↓
API Services Layer (http, apiClient)
      ↓
Backend REST API (/api/v1/*)
```

---

## 2. Directory Mapping & Layer Responsibilities

| Area | Status | Primary Responsibility |
| :--- | :--- | :--- |
| **`src/components/`** | **Implemented** | Reusable presentation UI elements (common buttons, inputs, cards, layouts, feedback modals). |
| **`src/pages/`** | **Implemented** | Route-level view composition connecting components, hooks, and services into full screens. |
| **`src/layouts/`** | **Implemented** | Structural shells (Header, Footer, Navigation, Dashboard Sidebars). |
| **`src/hooks/`** | **Implemented** | Reusable React stateful logic (custom hooks for network calls, debouncing, local storage). |
| **`src/services/`** | **Implemented** | Network communication abstraction (`apiClient.js`, `http.js`, domain API clients). |
| **`src/state/`** | **Planned** | Global application state management (cart context, auth session store, notification queue). |
| **`src/utils/`** | **Implemented** | Pure stateless helper functions (currency formatters, date utilities, string sanitizers). |
| **`src/constants/`** | **Implemented** | Static constants (route definitions, API endpoints, app storage keys, UI theme tokens). |
| **`src/validation/`** | **Planned** | Client-side form validation schemas (Zod/custom validators) for fast user feedback. |
| **`src/auth/`** | **Planned** | Client-side authentication tokens, session listeners, and route protection guards. |

---

## 3. Strict Non-Authoritative Client Boundary Rule

> [!IMPORTANT]
> **The frontend must NEVER be considered authoritative for security-sensitive business rules.**

The browser client is strictly a presentation and interaction layer. It must **never** be trusted as the source of truth for:
- Product prices or quote landed-cost calculations.
- Exchange rate calculations (INR to NPR conversion must be verified by backend).
- User permissions, roles, or authorization status.
- Payment status, gateway transaction verification, or invoice totals.
- Discount amounts, promo codes, or referral earnings.
- Final order confirmation amounts and shipping tariffs.

All security-sensitive validations, computations, and state changes are computed and verified server-side.

---

## 4. Client Request Lifecycle & User Interaction Flow

```text
User Interaction (e.g. submit quote form, click checkout)
      ↓
Client-Side Validation (instant UX feedback on required fields, formats)
      ↓
Service / API Request (dispatched via src/services/* with auth headers)
      ↓
Loading State (spinners, skeletons, button disabled to prevent duplicate submit)
      ↓
Server Response (standardized JSON ApiResponse or ApiError)
      ↓
Success / Error Handling (toast alert, error boundary, or redirection)
      ↓
UI State Update (re-render React view with updated server data)
```
