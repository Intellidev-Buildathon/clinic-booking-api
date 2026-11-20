# clinic-booking-api

Typed API client and shared types for
[clinic-booking-app](https://github.com/Intellidev-Buildathon/clinic-booking-app),
the CareFirst Clinics appointment booking service built by Northbeam Studio.

This is a **read-only reference repo**: the source of truth for the API is
`clinic-booking-app`. Types here mirror that repo and must be updated when its
API changes.

## Stack

- TypeScript (strict), consumed as `.ts` source (no build step)
- Global `fetch`, no HTTP library
- Vitest, pnpm, Node.js 22.18+

## Layout

```
src/
  types.ts     Clinic, Slot, SlotsResponse, Booking, Deposit, request and error types
  client.ts    ClinicBookingClient + ClinicBookingApiError
  index.ts     package entry point (re-exports both)
tests/
  client.test.ts   client behaviour against a mocked fetch
```

## Usage

```ts
import { ClinicBookingClient, ClinicBookingApiError } from "clinic-booking-api";

const client = new ClinicBookingClient({ baseUrl: "http://localhost:3000" });

await client.health(); // { status: "ok" }
const { slots } = await client.listSlots("carefirst-indiranagar", "2026-11-23");
try {
  const booking = await client.createBooking({
    clinicId: "carefirst-indiranagar",
    slotStart: slots[0].start, // UTC ISO
    patientName: "Asha Rao",
    patientPhone: "+919812345678",
  });
  console.log(booking.deposit.amountPaise); // 20000 = Rs 200
} catch (err) {
  if (err instanceof ClinicBookingApiError && err.code === "slot_taken") {
    // pick another slot
  }
}
```

Money is integer paise. Timestamps are UTC ISO strings; dates passed to
`listSlots` are calendar dates in clinic time (Asia/Kolkata).

## Development

```sh
pnpm install
pnpm test         # vitest run
pnpm typecheck    # tsc --noEmit
```

To try the client against a running server, start `clinic-booking-app` with
`pnpm dev` (port 3000) and point `baseUrl` at it.
