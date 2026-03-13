import { useState, useCallback } from 'react';
import Sidebar from './Sidebar';
import DashboardHeader from './DashboardHeader';
import ProfileForm from '@/components/profile/ProfileForm';
import styles from './DashboardLayout.module.css';

/* ── Stat cards data ──────────────────────────────────────── */
const stats = [
  { label: 'Total Bookings',   value: '284',     change: '+12% this month',       positive: true,  color: '#4f46e5' },
  { label: 'Active Customers', value: '91',      change: '+5% this month',        positive: true,  color: '#0ea5e9' },
  { label: 'Revenue',          value: '$12,460', change: '+18% this month',       positive: true,  color: '#10b981' },
  { label: 'Pending',          value: '7',       change: '2 less than last week', positive: false, color: '#f59e0b' },
];

const NAV_LABELS: Record<string, string> = {
  overview: 'Overview',
  bookings: 'Bookings',
  drivers: 'Drivers',
  vehicles: 'Vehicles',
  reports: 'Reports',
  templates: 'Templates',
  settings: 'Settings',
  profile: 'My Account',
};

export default function DashboardLayout() {
  const [activeNav, setActiveNav]           = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const pageTitle = NAV_LABELS[activeNav] ?? '';

  /* Single toggle: collapses on desktop, opens drawer on mobile */
  const handleMenuToggle = useCallback(() => {
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      setMobileSidebarOpen((v) => !v);
    } else {
      setSidebarCollapsed((v) => !v);
    }
  }, []);

  return (
    <div className={styles.layout}>
      <Sidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        activeNav={activeNav}
        onNavChange={setActiveNav}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      <div className={styles.main}>
        <DashboardHeader
          pageTitle={pageTitle}
          onMenuToggle={handleMenuToggle}
          onNavigate={setActiveNav}
        />

        <main className={styles.content}>
          {activeNav === 'overview'  && <OverviewContent />}
          {activeNav === 'settings'  && <SettingsContent />}
          {activeNav === 'profile'   && <ProfileForm />}
          {['bookings', 'drivers', 'vehicles', 'templates', 'reports'].includes(activeNav) && (
            <EmptyContent label={pageTitle} />
          )}
        </main>
      </div>
    </div>
  );
}

/* ── Overview content ─────────────────────────────────────── */
function OverviewContent() {
  return (
    <>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Overview</h1>
        <p className={styles.pageSubtitle}>Welcome back, Admin. Here&apos;s what&apos;s happening today.</p>
      </div>

      <div className={styles.statsGrid}>
        {stats.map((s) => (
          <div key={s.label} className={styles.statCard}>
            <div className={styles.statAccent} style={{ background: s.color }} />
            <div className={styles.statBody}>
              <div className={styles.statValue}>{s.value}</div>
              <div className={styles.statLabel}>{s.label}</div>
              <div className={`${styles.statChange} ${s.positive ? styles.positive : styles.negative}`}>
                {s.positive ? '↑' : '↓'} {s.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      <EmptyTable label="Recent Bookings" />
    </>
  );
}

/* ── Settings content ─────────────────────────────────────── */
function SettingsContent() {
  return (
    <>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Settings</h1>
        <p className={styles.pageSubtitle}>Manage your account and application preferences.</p>
      </div>

      <div className={styles.settingsGrid}>
        <SettingsCard
          title="Profile"
          description="Update your name, email, and account information."
          icon={<ProfileIcon />}
        />
        <SettingsCard
          title="Security"
          description="Change your password and manage authentication settings."
          icon={<LockIcon />}
        />
        <SettingsCard
          title="Notifications"
          description="Configure how and when you receive alerts and emails."
          icon={<BellIcon />}
        />
        <SettingsCard
          title="Appearance"
          description="Choose your preferred theme and display settings."
          icon={<PaletteIcon />}
        />
      </div>
    </>
  );
}

function SettingsCard({ title, description, icon }: { title: string; description: string; icon: React.ReactNode }) {
  return (
    <div className={styles.settingsCard}>
      <div className={styles.settingsCardIcon}>{icon}</div>
      <div className={styles.settingsCardContent}>
        <div className={styles.settingsCardTitle}>{title}</div>
        <div className={styles.settingsCardDesc}>{description}</div>
      </div>
      <div className={styles.settingsCardArrow}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </div>
    </div>
  );
}

/* ── Empty content for non-built pages ────────────────────── */
function EmptyContent({ label }: { label: string }) {
  return (
    <>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>{label}</h1>
        <p className={styles.pageSubtitle}>This section is ready for future development.</p>
      </div>
      <EmptyTable label={`${label} data`} />
    </>
  );
}

/* ── Empty table placeholder ──────────────────────────────── */
function EmptyTable({ label }: { label: string }) {
  return (
    <div className={styles.emptyTable}>
      <div className={styles.emptyTableIcon}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.4" strokeLinecap="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="3" y1="15" x2="21" y2="15" />
          <line x1="9" y1="9" x2="9" y2="21" />
        </svg>
      </div>
      <p className={styles.emptyTableTitle}>{label}</p>
      <p className={styles.emptyTableSub}>No data available yet. This section is ready for future development.</p>
    </div>
  );
}

/* ── Settings card icons ─────────────────────────────────── */
function ProfileIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  );
}

function PaletteIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="8.4" cy="10.8" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="15.6" cy="10.8" r="1.2" fill="currentColor" stroke="none" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
    </svg>
  );
}
