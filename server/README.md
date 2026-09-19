# SastoMarts Backend (API Server)

SastoMarts API is the backend engine powering the India-to-Nepal cross-border e-commerce and product-sourcing platform.

## Platform Purpose
The platform enables customers and businesses in Nepal to source and purchase products directly from major Indian marketplaces and suppliers with:
- Automated INR-to-NPR fixed peg currency calculations (1 INR = 1.6 NPR).
- Customs duty, service charges, and cross-border logistics estimation.
- Doorstep delivery across Nepal.
- Integrated payment gateways (eSewa, Khalti, Fonepay, Stripe).

## Technology Stack
- **Runtime:** Node.js (v20+ / ES Modules)
- **Framework:** Express 4 (Strict JavaScript)
- **Security:** Helmet, CORS Origin Whitelist, Rate Limiting, Input Sanitization
- **Logging:** Morgan (Environment-configurable)

## Development Commands
```bash
# Navigate to server
cd server

# Install packages
npm install

# Start development server with live reload (nodemon)
npm run dev

# Start production server
npm start

# Run syntax/lint check
npm run lint
```

## Architecture Overview
The backend follows an enterprise layered architecture:
`Route → Middleware → Controller → Service → Model / Database`
