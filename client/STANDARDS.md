# Client Engineering & Development Standards

---

## 1. Global JavaScript Only Rule
- This project strictly uses **JavaScript (ES2022+ / JSX)**.
- Allowed file extensions: `.js`, `.jsx`.
- Disallowed: TypeScript (`.ts`, `.tsx`, `tsconfig.json`, `@types/*`).

---

## 2. Component Design & Composition Standards
1. **Single Responsibility**: Each UI component must render exactly one logical piece of interface.
2. **Pure Presentation**: Components in `src/components/common/` must be presentation-only and receive data via props.
3. **Hook Extraction**: When component state logic exceeds 20-30 lines, extract it into a reusable custom hook in `src/hooks/`.
4. **No Inline Business Logic**: Pricing conversions, customs math, or data mutations must never be written inside JSX components. Delegate to `src/utils/` or `src/services/`.

---

## 3. Code Hygiene & Maintainability Principles
- **Clarity over Cleverness**: Write readable, self-documenting code with meaningful variable and function names.
- **Avoid Premature Optimization**: Optimize only after identifying measured performance bottlenecks.
- **Avoid Unnecessary Abstraction**: Do not build complex generic wrappers until a pattern has repeated at least 3 times.
- **Consistent Error Handling**: Always capture asynchronous errors and present user-friendly error feedback states.
- **Centralized Constants**: Never hardcode route strings, API paths, or localStorage keys inline. Use `src/constants/`.
