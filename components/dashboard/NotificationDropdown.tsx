import { useState, useRef, useEffect } from 'react';
import styles from './NotificationDropdown.module.css';

/* ── Types ───────────────────────────────────────────────── */
interface Notification {
  id: string;
  type: 'booking' | 'driver' | 'cancel' | 'alert';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

/* ── Seed data ───────────────────────────────────────────── */
const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'booking',
    title: 'New booking received',
    message: 'Booking #BK-1042 has been placed by John Smith.',
    time: '2 min ago',
    read: false,
  },
  {
    id: '2',
    type: 'driver',
    title: 'Driver assigned',
    message: 'Driver Ahmed has been assigned to booking #BK-1040.',
    time: '15 min ago',
    read: false,
  },
  {
    id: '3',
    type: 'cancel',
    title: 'Booking cancelled',
    message: 'Booking #BK-1038 was cancelled by the customer.',
    time: '1 hr ago',
    read: false,
  },
  {
    id: '4',
    type: 'alert',
    title: 'System alert',
    message: 'Scheduled maintenance window tonight at 02:00 UTC.',
    time: '3 hr ago',
    read: true,
  },
  {
    id: '5',
    type: 'booking',
    title: 'New booking received',
    message: 'Booking #BK-1037 has been placed by Sara Lee.',
    time: 'Yesterday',
    read: true,
  },
];

/* ── Icon colours per type ───────────────────────────────── */
const TYPE_META = {
  booking: { bg: '#ede9fe', color: '#4f46e5' },
  driver:  { bg: '#d1fae5', color: '#059669' },
  cancel:  { bg: '#fee2e2', color: '#dc2626' },
  alert:   { bg: '#fef3c7', color: '#d97706' },
};

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const containerRef = useRef<HTMLDivElement>(null);

  const unreadCount = items.filter((n) => !n.read).length;

  /* Close on outside click or Escape */
  useEffect(() => {
    const onMouse = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    if (open) {
      document.addEventListener('mousedown', onMouse);
      document.addEventListener('keydown', onKey);
    }
    return () => {
      document.removeEventListener('mousedown', onMouse);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const markAll = () => setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  const markOne = (id: string) =>
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

  return (
    <div className={styles.notifArea} ref={containerRef}>
      {/* Bell button */}
      <button
        className={`${styles.bellBtn} ${open ? styles.bellBtnOpen : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <BellIcon />
        {unreadCount > 0 && <span className={styles.badge} aria-hidden="true" />}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className={styles.dropdown}>
          {/* Header */}
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>
              Notifications{unreadCount > 0 && ` (${unreadCount})`}
            </span>
            {unreadCount > 0 && (
              <button className={styles.markAllBtn} onClick={markAll}>
                Mark all as read
              </button>
            )}
          </div>

          {/* List */}
          <div className={styles.list}>
            {items.length === 0 ? (
              <p className={styles.empty}>No notifications yet.</p>
            ) : (
              items.map((n) => {
                const meta = TYPE_META[n.type];
                return (
                  <div
                    key={n.id}
                    className={`${styles.item} ${!n.read ? styles.itemUnread : ''}`}
                    onClick={() => markOne(n.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && markOne(n.id)}
                  >
                    <div
                      className={styles.iconWrap}
                      style={{ background: meta.bg, color: meta.color }}
                    >
                      <NotifTypeIcon type={n.type} />
                    </div>
                    <div className={styles.itemBody}>
                      <div className={styles.itemTitle}>{n.title}</div>
                      <div className={styles.itemMsg}>{n.message}</div>
                      <div className={styles.itemTime}>{n.time}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className={styles.panelFooter}>
            <button className={styles.viewAllBtn} onClick={() => setOpen(false)}>
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── SVG Icons ───────────────────────────────────────────── */
function BellIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  );
}

function NotifTypeIcon({ type }: { type: Notification['type'] }) {
  if (type === 'booking') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    );
  }
  if (type === 'driver') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    );
  }
  if (type === 'cancel') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    );
  }
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
