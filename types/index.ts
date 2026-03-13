/* =====================================================
   SHARED TYPES FOR PREMIUM TAXI BOOKING SYSTEM
   ===================================================== */

/* ── Booking ─────────────────────────────────────────────── */

export interface Booking {
  id: string;
  refCode: string;
  clientName: string;
  clientNumber: string;
  clientEmail: string;
  routeLocation: string;
  vehicleTitle: string;
  pickupLocation: string;
  dropoffLocation: string;
  driverNameSnapshot?: string;
  bookingDate: string;
  createdAt: string;
  priceSar: number;
  bookingStatus: string;
  rideStatus?: string;
  paymentStatus?: string;
  [key: string]: unknown;
}

/* ── Booking History ─────────────────────────────────────── */

export interface BookingHistoryEntry {
  id: string;
  action: string;
  details?: string;
  timestamp: string;
  user: string;
}

/* ── Helpers ─────────────────────────────────────────────── */

export function generateHistoryId(): string {
  return `hist_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
