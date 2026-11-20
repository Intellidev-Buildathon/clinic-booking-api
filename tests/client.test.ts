import { describe, expect, it, vi } from "vitest";
import { ClinicBookingApiError, ClinicBookingClient } from "../src/index.ts";

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

describe("ClinicBookingClient", () => {
  it("calls the API and surfaces typed errors", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(json(200, { status: "ok" }))
      .mockResolvedValueOnce(
        json(200, { clinicId: "carefirst-indiranagar", date: "2026-11-23", timeZone: "Asia/Kolkata", openingHours: [], slots: [] }),
      )
      .mockResolvedValueOnce(json(409, { error: "slot_taken", message: "that slot is already booked" }));
    const client = new ClinicBookingClient({ baseUrl: "http://localhost:3000/", fetch: fetchMock });

    expect(await client.health()).toEqual({ status: "ok" });
    const slotsRes = await client.listSlots("carefirst-indiranagar", "2026-11-23");
    expect(slotsRes.slots).toEqual([]);
    expect(slotsRes.openingHours).toEqual([]);
    expect(fetchMock.mock.calls[1]?.[0]).toBe("http://localhost:3000/clinics/carefirst-indiranagar/slots?date=2026-11-23");

    const err = await client
      .createBooking({
        clinicId: "carefirst-indiranagar",
        slotStart: "2026-11-23T04:30:00.000Z",
        patientName: "Asha Rao",
        patientPhone: "+919812345678",
      })
      .catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ClinicBookingApiError);
    expect(err).toMatchObject({ status: 409, code: "slot_taken" });
    expect(fetchMock.mock.calls[2]?.[1]).toMatchObject({ method: "POST" });
  });
});
