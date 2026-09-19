# SastoMarts Frontend (Client)

SastoMarts is a cross-border India-to-Nepal B2B/B2C e-commerce and product-sourcing platform. This repository contains the Single Page Application (SPA) built with **React 19** and **Vite**.

## Technology Stack
- **Framework:** React 19 (JavaScript / JSX)
- **Build Tool:** Vite 8
- **Linter:** Oxlint (JavaScript/JSX rules only)
- **Styling:** CSS variables & modular CSS architecture

## Development Commands
```bash
# Navigate to client
cd client

# Install packages
npm install

# Start Vite development server (http://localhost:5173)
npm run dev

# Run JavaScript/JSX linter
npm run lint

# Build production bundle
npm run build

# Preview production build locally
npm run preview
```

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
