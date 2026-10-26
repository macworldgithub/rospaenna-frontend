This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

The tee-time screen reads saved results from the Python backend. Copy
`.example.env` to `.env.local`, set `BOOKING_BACKEND_URL` to the backend URL,
and set `BOOKING_API_KEY` to the same private value as the backend. These are
server settings; do not prefix them with `NEXT_PUBLIC_`. Start the backend using
`../rosapenna-backend/README.md` before opening `/tee-times`.

MongoDB is accessed only by the Python backend. The frontend does not need a
MongoDB driver or `MONGODB_URI`. If the URI is already in your frontend env, it
remains unused; keep it server-only or remove that redundant copy. Never use a
`NEXT_PUBLIC_` prefix for a database URI. Configure `MONGODB_URI` and the optional
`MONGODB_DATABASE` in the backend, and check backend `/health/ready` before use.

Browsing and the Refresh Tee Times button read MongoDB snapshots through the backend; neither calls
BRS. The screen displays when the data was fetched. The backend refreshes both
supported courses for the next 30 days at 05:00 Europe/Dublin, with a catch-up
run on startup after that hour if today's run has not started. See backend
`GET /teesheets/status` for progress, dates and errors. Dates without snapshots
show a retry message rather than made-up availability.

When a guest submits the booking form, `/api/checkout` asks the backend to check
the selected time, green fee, player count, currency and total against live BRS.
A changed price or unavailable slot returns HTTP 409 and blocks checkout.
The fresh results are saved so returning to `/tee-times` shows the new data.
The existing BRS checkout bridge still needs valid `BRS_GOLF_COOKIE` and
`BRS_GOLF_XSRF_TOKEN` values. Live checking does not reserve a slot or confirm
payment. This work does not integrate the separate homepage Stay & Play calculator.

Checkout checks its BRS session configuration before making a live price check.
Missing session settings return HTTP 503 with a setup message; the frontend
terminal names the missing environment variables without printing their values.
Keep both values from an authorized, matching BRS session in the frontend's
server environment and restart Next.js after changing them. Expired or rejected
sessions return a connection-renewal message; these values are not permanent API
credentials and do not establish a production booking integration.

The cookie setting must contain a named `BRSVisitors.Session=...` cookie, not
only its value. Guest details and explicit terms acceptance are validated before
any live check or checkout request. The selected green fee supplies the number
of holes; an empty tee-sheet holes field does not overwrite the selected rate.
An upstream HTTP 429 remains a rate-limit response, with `Retry-After` forwarded
when BRS supplies a valid delay. Wait before retrying; changing credentials does
not resolve a rate limit. Development allows both `localhost` and `127.0.0.1`
through the explicit Next.js `allowedDevOrigins` setting.

After an upstream 429, checkout pauses locally before another backend live check
or BRS preparation is attempted. BRS's valid `Retry-After` is respected; otherwise
`BRS_CHECKOUT_COOLDOWN_SECONDS` supplies a conservative local pause (default 300,
allowed 30–3600 seconds). That fallback is not a promise that BRS will unblock
after five minutes. Concurrent preparation requests are rejected locally too;
there are no automatic retries. This gate is shared across development reloads
within one Node process, but is not a distributed rate limiter and resets on a
process restart. Production instances still need shared coordination.

Run `npm run test:checkout` for offline cooldown, concurrency and request-count
regressions. These tests do not contact BRS, create bookings or make payments.

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
