// Mirrors the types in clinic-booking-app. Keep these in sync with
// clinic-booking-app/src/clinics/types.ts and src/bookings/types.ts.

export interface OpeningWindow {
  /** Clinic local time (Asia/Kolkata), "HH:MM" 24h. */
  open: string;
  close: string;
}

export type OpeningHours = Partial<Record<0 | 1 | 2 | 3 | 4 | 5 | 6, OpeningWindow[]>>;

export interface Clinic {
  id: string;
  name: string;
  city: string;
  timeZone: "Asia/Kolkata";
  slotMinutes: number;
  /** Booking deposit in paise (100 paise = 1 rupee). */
  depositPaise: number;
  openingHours: OpeningHours;
}

export interface Slot {
  clinicId: string;
  /** UTC ISO timestamps. */
  start: string;
  end: string;
}

export interface SlotAvailability extends Slot {
  available: boolean;
}

export interface SlotsResponse {
  clinicId: string;
  /** Calendar date in clinic time, YYYY-MM-DD. */
  date: string;
  timeZone: "Asia/Kolkata";
  slots: SlotAvailability[];
}

export type DepositStatus = "pending" | "paid" | "refunded";

/** Deposit collected through Razorpay (UPI). Money is always integer paise. */
export interface Deposit {
  amountPaise: number;
  status: DepositStatus;
  razorpayOrderId: string | null;
}

export type BookingStatus = "pending_payment" | "confirmed" | "cancelled" | "completed" | "no_show";

export interface Booking {
  id: string;
  clinicId: string;
  slotStart: string;
  slotEnd: string;
  patientName: string;
  /** E.164 Indian mobile number, e.g. +919812345678. */
  patientPhone: string;
  status: BookingStatus;
  deposit: Deposit;
  createdAt: string;
  /** Doctor assigned to the booking/slot, e.g. "Dr. Neha Sharma". */
  doctor?: string;
  /** ISO timestamp when the 24-hour reminder was dispatched, if sent. */
  reminderSentAt?: string | null;
}

export interface CreateBookingRequest {
  clinicId: string;
  /** UTC ISO timestamp of the slot start. */
  slotStart: string;
  patientName: string;
  patientPhone: string;
}

export type ApiErrorCode =
  | "invalid_input"
  | "clinic_not_found"
  | "outside_opening_hours"
  | "slot_taken"
  | "not_found"
  | "internal_error";

export interface ApiErrorBody {
  error: ApiErrorCode;
  message?: string;
}
