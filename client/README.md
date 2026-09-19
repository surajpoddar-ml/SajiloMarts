# SastoMarts Frontend (React Client)

SastoMarts is a production-grade MERN cross-border e-commerce and product-sourcing platform connecting customers in Nepal with suppliers and marketplaces across India (Amazon.in, Flipkart, Myntra, IndiaMART, and regional wholesalers).

---

## 1. Project Purpose & Problem Space
Cross-border commerce between India and Nepal currently faces key hurdles:
- **Currency & Payment Barriers**: Customers in Nepal cannot directly pay Indian merchant portals using domestic wallets (eSewa, Khalti, Fonepay).
- **Logistics & Customs Complexity**: Sourcing items requires calculating customs tariffs, weight-based cross-border freight, and local delivery in Nepal.
- **Sourcing Verification**: Buyers need URL quote extraction and landed cost estimates before committing to orders.

SastoMarts solves this by providing:
1. **URL Sourcing & Quote Engine**: Direct link paste to estimate landed cost in Nepali Rupees (NPR).
2. **Local Payment Integration**: Seamless checkout via eSewa, Khalti, bank transfers, and domestic cards.
3. **End-to-End Cross-Border Tracking**: Real-time status updates from India fulfillment hubs through Nepal customs to customer doorstep.

## 2. Technology Stack
- **Framework:** React 19 (JavaScript / JSX)
- **Build Tool:** Vite 8
- **Linter:** Oxlint (Pure JavaScript / JSX rules)
- **Styling:** CSS variables & modular component styling

---

## 3. Verified Development Commands

| Command | Action / Behavior |
| :--- | :--- |
| `npm install` | Installs all client dependencies from `package.json`. |
| `npm run dev` | Launches the local Vite development server at `http://localhost:5173` with Hot Module Replacement (HMR). |
| `npm run build` | Compiles optimized static assets into `dist/` directory. |
| `npm run preview` | Runs a local static web server to preview the production bundle. |
| `npm run lint` | Executes fast syntax & linting checks using Oxlint. |

## Directory Overview
```text
client/
├── public/                 # Public static assets (favicon, icons)
├── src/
│   ├── assets/             # Bundled static images and media
│   ├── components/         # Reusable UI component library (common, layout, feedback, forms)
│   ├── config/             # Public client configuration & feature flags
│   ├── constants/          # Route constants, API endpoints, application storage keys
│   ├── context/            # React Context global state providers
│   ├── hooks/              # Custom reusable React hooks
│   ├── layouts/            # Page layout wrappers (MainLayout)
│   ├── pages/              # Route view directories
│   ├── services/           # Centralized HTTP network client (http, health.service)
│   ├── styles/             # Design tokens and global stylesheets
│   └── utils/              # Pure utility functions (currency, storage, validators)
├── index.html              # HTML entry point
├── package.json            # Scripts and dependencies
└── vite.config.js          # Vite config with '@' alias
```
