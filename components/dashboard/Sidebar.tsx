import styles from './Sidebar.module.css';

export interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  activeNav: string;
  onNavChange: (id: string) => void;
  onMobileClose: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const MAIN_NAV: NavItem[] = [
  { id: 'overview',  label: 'Overview',  icon: <OverviewIcon />  },
  { id: 'bookings',  label: 'Bookings',  icon: <BookingsIcon />  },
  { id: 'drivers',   label: 'Drivers',   icon: <DriversIcon />   },
  { id: 'vehicles',  label: 'Vehicles',  icon: <VehiclesIcon />  },
];

const SYSTEM_NAV: NavItem[] = [
  { id: 'reports',   label: 'Reports',   icon: <ReportsIcon />   },
  { id: 'templates', label: 'Templates', icon: <TemplatesIcon /> },
  { id: 'settings',  label: 'Settings',  icon: <SettingsIcon />  },
];

export default function Sidebar({
  collapsed,
  mobileOpen,
  activeNav,
  onNavChange,
  onMobileClose,
}: SidebarProps) {
  return (
    <>
      {/* Mobile backdrop overlay */}
      <div
        className={`${styles.overlay} ${mobileOpen ? styles.overlayVisible : ''}`}
        onClick={onMobileClose}
        aria-hidden="true"
      />

      <aside
        className={[
          styles.sidebar,
          collapsed ? styles.collapsed : '',
          mobileOpen ? styles.mobileOpen : '',
        ]
          .filter(Boolean)
          .join(' ')}
        aria-label="Main navigation"
      >
        {/* ── Logo row ── */}
        <div className={styles.logoRow}>
          <div className={styles.logoIcon}>
            <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="8" fill="#6366f1" />
              <path
                d="M7 14L12 19L21 9"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className={styles.logoText}>RMS Dashboard</span>
          {/* Only visible on mobile */}
          <button
            className={styles.mobileCloseBtn}
            onClick={onMobileClose}
            aria-label="Close navigation"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* ── Navigation ── */}
        <nav className={styles.nav}>
          <NavGroup
            label="Main"
            items={MAIN_NAV}
            activeNav={activeNav}
            collapsed={collapsed}
            onNavChange={onNavChange}
            onMobileClose={onMobileClose}
          />
          <NavGroup
            label="System"
            items={SYSTEM_NAV}
            activeNav={activeNav}
            collapsed={collapsed}
            onNavChange={onNavChange}
            onMobileClose={onMobileClose}
          />
        </nav>

        {/* ── Footer user strip ── */}
        <div className={styles.sidebarUser}>
          <div className={styles.sidebarAvatar}>A</div>
          <div className={styles.sidebarUserInfo}>
            <span className={styles.sidebarUserName}>Admin</span>
            <span className={styles.sidebarUserRole}>Administrator</span>
          </div>
        </div>
      </aside>
    </>
  );
}

/* ── Nav group ──────────────────────────────────────────── */
function NavGroup({
  label,
  items,
  activeNav,
  collapsed,
  onNavChange,
  onMobileClose,
}: {
  label: string;
  items: NavItem[];
  activeNav: string;
  collapsed: boolean;
  onNavChange: (id: string) => void;
  onMobileClose: () => void;
}) {
  return (
    <div className={styles.navGroup}>
      <span className={styles.navGroupLabel}>{label}</span>
      {items.map((item) => (
        <button
          key={item.id}
          className={`${styles.navItem} ${activeNav === item.id ? styles.navActive : ''}`}
          onClick={() => {
            onNavChange(item.id);
            onMobileClose();
          }}
          title={collapsed ? item.label : undefined}
          aria-current={activeNav === item.id ? 'page' : undefined}
        >
          <span className={styles.navIcon}>{item.icon}</span>
          <span className={styles.navLabel}>{item.label}</span>
        </button>
      ))}
    </div>
  );
}

/* ── SVG Icons (function declarations are hoisted) ──────── */
function OverviewIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function BookingsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function ReportsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  );
}

function DriversIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="5" r="2" />
      <path d="M15 8H9l-2 7h10l-2-7z" />
      <path d="M7 15l-2 5M17 15l2 5" />
      <circle cx="8" cy="19" r="1" fill="currentColor" stroke="none" />
      <circle cx="16" cy="19" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function VehiclesIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 17H3a2 2 0 01-2-2v-4a2 2 0 012-2h2l2-3h10l2 3h2a2 2 0 012 2v4a2 2 0 01-2 2h-2" />
      <circle cx="7" cy="17" r="2" />
      <circle cx="17" cy="17" r="2" />
    </svg>
  );
}

function TemplatesIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}
