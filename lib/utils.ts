/* =====================================================
   UTILITY FUNCTIONS FOR PREMIUM TAXI BOOKING SYSTEM
   ===================================================== */

import type { Booking, BookingHistoryEntry } from '@/types';
import { generateHistoryId } from '@/types';

/* ── Formatting Utilities ────────────────────────────────── */

export function formatSAR(amount: number): string {
  return `SAR ${amount.toLocaleString()}`;
}

export function formatDate(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateTime(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTime(time: string): string {
  if (!time) return '';
  const [h, m] = time.split(':');
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${m} ${ampm}`;
}

export function formatRelativeTime(iso: string): string {
  if (!iso) return '';
  const now = new Date();
  const date = new Date(iso);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(iso.split('T')[0]);
}

export function formatPhone(phone: string): string {
  // Display phone in readable format
  return phone.replace(/(\+966)(\d{2})(\d{3})(\d{4})/, '$1 $2 $3 $4');
}

/* ── History Utilities ───────────────────────────────────── */

export function createHistoryEntry(
  action: string,
  details?: string,
  user: string = 'Admin'
): BookingHistoryEntry {
  return {
    id: generateHistoryId(),
    action,
    details,
    timestamp: new Date().toISOString(),
    user,
  };
}

export type HistoryAction =
  | 'Booking Created'
  | 'Booking Updated'
  | 'Driver Assigned'
  | 'Driver Changed'
  | 'Driver Unassigned'
  | 'Payment Status Changed'
  | 'Ride Status Changed'
  | 'Booking Status Changed'
  | 'Financials Updated'
  | 'Ride Started'
  | 'Ride Completed'
  | 'Ride Cancelled'
  | 'Note Added'
  | 'Bulk Status Update';

export function getHistoryIcon(action: string): string {
  const iconMap: Record<string, string> = {
    'Booking Created': 'plus',
    'Booking Updated': 'edit',
    'Driver Assigned': 'user-plus',
    'Driver Changed': 'user-switch',
    'Driver Unassigned': 'user-minus',
    'Payment Status Changed': 'credit-card',
    'Ride Status Changed': 'car',
    'Booking Status Changed': 'file-text',
    'Financials Updated': 'dollar-sign',
    'Ride Started': 'play',
    'Ride Completed': 'check-circle',
    'Ride Cancelled': 'x-circle',
    'Note Added': 'message-square',
    'Bulk Status Update': 'layers',
  };
  return iconMap[action] || 'activity';
}

export function getHistoryColor(action: string): string {
  if (action.includes('Created') || action.includes('Completed')) return '#16a34a';
  if (action.includes('Cancelled') || action.includes('Unassigned')) return '#dc2626';
  if (action.includes('Assigned') || action.includes('Updated')) return '#4f46e5';
  if (action.includes('Payment')) return '#0ea5e9';
  if (action.includes('Ride')) return '#f59e0b';
  return '#64748b';
}

/* ── Status Utilities ────────────────────────────────────── */

export function getBookingStatusColor(status: string): { bg: string; text: string } {
  const colors: Record<string, { bg: string; text: string }> = {
    Confirmed: { bg: '#dcfce7', text: '#15803d' },
    Pending: { bg: '#fef3c7', text: '#b45309' },
    Cancelled: { bg: '#fee2e2', text: '#dc2626' },
  };
  return colors[status] || { bg: '#f1f5f9', text: '#64748b' };
}

export function getRideStatusColor(status: string): { bg: string; text: string } {
  const colors: Record<string, { bg: string; text: string }> = {
    Scheduled: { bg: '#e0f2fe', text: '#0369a1' },
    'In Progress': { bg: '#fef3c7', text: '#b45309' },
    Completed: { bg: '#dcfce7', text: '#15803d' },
    Cancelled: { bg: '#fee2e2', text: '#dc2626' },
    'No Show': { bg: '#f1f5f9', text: '#64748b' },
  };
  return colors[status] || { bg: '#f1f5f9', text: '#64748b' };
}

export function getPaymentStatusColor(status: string): { bg: string; text: string } {
  const colors: Record<string, { bg: string; text: string }> = {
    Received: { bg: '#dcfce7', text: '#15803d' },
    Pending: { bg: '#fef3c7', text: '#b45309' },
    Partial: { bg: '#e0f2fe', text: '#0369a1' },
    Refunded: { bg: '#f3e8ff', text: '#7c3aed' },
  };
  return colors[status] || { bg: '#f1f5f9', text: '#64748b' };
}

export function getDriverAvailabilityColor(status: string): { bg: string; text: string } {
  const colors: Record<string, { bg: string; text: string }> = {
    available: { bg: '#dcfce7', text: '#15803d' },
    busy: { bg: '#fef3c7', text: '#b45309' },
    off: { bg: '#f1f5f9', text: '#64748b' },
    leave: { bg: '#e0f2fe', text: '#0369a1' },
    inactive: { bg: '#fee2e2', text: '#dc2626' },
  };
  return colors[status] || { bg: '#f1f5f9', text: '#64748b' };
}

/* ── Validation Utilities ────────────────────────────────── */

export function validatePhone(phone: string): boolean {
  // Saudi phone format: +966 followed by 9 digits
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 10 && cleaned.length <= 15;
}

export function validateEmail(email: string): boolean {
  if (!email) return true; // Email is optional
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateRequired(value: string): boolean {
  return value.trim().length > 0;
}

/* ── Driver Calculation Utilities ────────────────────────── */

export function calculateDriverEarning(totalPrice: number, commission: number): number {
  return Math.max(0, totalPrice - commission);
}

export function calculateCommissionPercent(totalPrice: number, commission: number): number {
  if (totalPrice === 0) return 0;
  return Math.round((commission / totalPrice) * 100);
}

/* ── Search Utilities ────────────────────────────────────── */

export function searchBookings(bookings: Booking[], query: string): Booking[] {
  if (!query.trim()) return bookings;
  const q = query.toLowerCase().trim();
  
  return bookings.filter((b) =>
    b.id.toLowerCase().includes(q) ||
    b.refCode.toLowerCase().includes(q) ||
    b.clientName.toLowerCase().includes(q) ||
    b.clientNumber.includes(q) ||
    b.clientEmail.toLowerCase().includes(q) ||
    b.routeLocation.toLowerCase().includes(q) ||
    b.vehicleTitle.toLowerCase().includes(q) ||
    b.pickupLocation.toLowerCase().includes(q) ||
    b.dropoffLocation.toLowerCase().includes(q) ||
    (b.driverNameSnapshot?.toLowerCase().includes(q) ?? false)
  );
}

/* ── Sorting Utilities ───────────────────────────────────── */

export type BookingSortKey = 'date' | 'created' | 'price' | 'customer' | 'status';

export function sortBookings(bookings: Booking[], sortKey: BookingSortKey, desc: boolean = true): Booking[] {
  return [...bookings].sort((a, b) => {
    let comparison = 0;
    
    switch (sortKey) {
      case 'date':
        comparison = a.bookingDate.localeCompare(b.bookingDate);
        break;
      case 'created':
        comparison = a.createdAt.localeCompare(b.createdAt);
        break;
      case 'price':
        comparison = a.priceSar - b.priceSar;
        break;
      case 'customer':
        comparison = a.clientName.localeCompare(b.clientName);
        break;
      case 'status':
        comparison = a.bookingStatus.localeCompare(b.bookingStatus);
        break;
    }
    
    return desc ? -comparison : comparison;
  });
}

/* ── Date Range Utilities ────────────────────────────────── */

export type DateRangeKey = 'all' | 'today' | 'week' | 'month' | 'year' | 'custom';

export function getDateRangeForKey(key: DateRangeKey): { from: string; to: string } {
  const today = new Date();
  const formatDate = (d: Date) => d.toISOString().split('T')[0];
  
  switch (key) {
    case 'today':
      return { from: formatDate(today), to: formatDate(today) };
    case 'week': {
      const weekAgo = new Date(today);
      weekAgo.setDate(today.getDate() - 7);
      return { from: formatDate(weekAgo), to: formatDate(today) };
    }
    case 'month': {
      const monthAgo = new Date(today);
      monthAgo.setMonth(today.getMonth() - 1);
      return { from: formatDate(monthAgo), to: formatDate(today) };
    }
    case 'year': {
      const yearAgo = new Date(today);
      yearAgo.setFullYear(today.getFullYear() - 1);
      return { from: formatDate(yearAgo), to: formatDate(today) };
    }
    default:
      return { from: '', to: '' };
  }
}
