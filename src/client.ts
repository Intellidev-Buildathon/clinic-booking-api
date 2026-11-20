import type { ApiErrorBody, ApiErrorCode, Booking, CreateBookingRequest, SlotsResponse } from "./types.ts";

export class ClinicBookingApiError extends Error {
  readonly status: number;
  readonly code: ApiErrorCode | "unknown";
  constructor(status: number, code: ApiErrorCode | "unknown", message: string) {
    super(message);
    this.name = "ClinicBookingApiError";
    this.status = status;
    this.code = code;
  }
}

export interface ClinicBookingClientOptions {
  /** e.g. "http://localhost:3000" */
  baseUrl: string;
  /** Injected for tests; defaults to the global fetch. */
  fetch?: typeof fetch;
}

/** Typed client for the clinic-booking-app HTTP API. */
export class ClinicBookingClient {
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;

  constructor(options: ClinicBookingClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/+$/, "");
    this.fetchImpl = options.fetch ?? globalThis.fetch;
  }

  health(): Promise<{ status: "ok" }> {
    return this.request("GET", "/health");
  }

  /** Lists slots for a clinic on a calendar date in clinic time (YYYY-MM-DD). */
  listSlots(clinicId: string, date: string): Promise<SlotsResponse> {
    return this.request("GET", `/clinics/${encodeURIComponent(clinicId)}/slots?date=${encodeURIComponent(date)}`);
  }

  createBooking(input: CreateBookingRequest): Promise<Booking> {
    return this.request("POST", "/bookings", input);
  }

  /** Cancels an appointment booking and frees its slot. */
  cancelBooking(bookingId: string): Promise<Booking> {
    return this.request("POST", `/bookings/${encodeURIComponent(bookingId)}/cancel`);
  }

  private async request<T>(method: "GET" | "POST", path: string, body?: unknown): Promise<T> {
    const res = await this.fetchImpl(`${this.baseUrl}${path}`, {
      method,
      headers: body === undefined ? { accept: "application/json" } : { accept: "application/json", "content-type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await res.text();
    const data: unknown = text ? JSON.parse(text) : undefined;
    if (!res.ok) {
      const err = (data ?? {}) as Partial<ApiErrorBody>;
      throw new ClinicBookingApiError(res.status, err.error ?? "unknown", err.message ?? `HTTP ${res.status}`);
    }
    return data as T;
  }
}
