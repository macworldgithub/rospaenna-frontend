# Rosapenna Booking Frontend

Next.js web application for Rosapenna Hotel & Golf Resort. Allows guests to browse rooms and tee times, configure bespoke Stay & Play packages, complete deposit payments, and manage existing reservations.

---

## Features

- **Stay & Play Package Builder**: Interactive room selection, golf course tee-time picker, and real-time pricing breakdown.
- **Tee-Time Browsing**: Live view of course availability and green fee rates across Rosapenna's championship links.
- **Secure Checkout & Simulation**: Integrated deposit payment flow with sandbox test simulation support.
- **Manage My Booking (MMB)**: Guest self-service portal for viewing reservations and submitting change requests.

---

## Prerequisites

- **Node.js**: 20.x or newer
- **npm**: 10.x or newer
- **Rosapenna Backend**: Running locally on port `4040` (see `../rosapenna-backend/README.md`)

---

## Installation

Run the following commands from the `rospaenna-frontend` directory:

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables
cp .example.env .env.local
```

---

## Environment Variables

Edit `.env.local` to configure the backend connection:

```dotenv
# Backend service endpoint
BOOKING_BACKEND_URL=http://127.0.0.1:4040

# Shared API key matching BOOKING_API_KEY in rosapenna-backend
BOOKING_API_KEY=replace-with-the-backend-api-key
```

*Note: These are server-side environment variables. Do not prefix them with `NEXT_PUBLIC_`.*

---

## Running the Application

### Development Server

```bash
npm run dev
```

The application runs at **`http://localhost:3030`**.

### Production Build

```bash
# Build production bundle
npm run build

# Start production server
npm run start
```

---

## Running Tests & Checks

```bash
# Run all unit tests
npm test

# Run TypeScript type check
npx tsc --noEmit

# Run ESLint check
npm run lint

# Run specific payment simulation test
npm run test:n06

# Run N07 booking confirmation route denial security tests
npm run test:n07
```

---

## Ticket N07: Route Security and Denial Controls

Under Ticket N07 security policy, the frontend enforces strict server-side boundaries:
- `POST /api/communications/send`: Rejects `booking_confirmation` template with HTTP 403 and `Cache-Control: no-store`.
- `GET /api/communications/itinerary/[id]`: Denies unscoped PDF downloads with HTTP 403 and `Cache-Control: no-store`.
- No public guest confirmation sending or unscoped booking PDF download is exposed.

