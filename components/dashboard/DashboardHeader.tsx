import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import styles from './DashboardHeader.module.css';

interface DashboardHeaderProps {
  pageTitle: string;
  onMenuToggle: () => void;
  onNavigate: (navId: string) => void;
}

export default function DashboardHeader({
  pageTitle,
  onMenuToggle,
  onNavigate,
}: DashboardHeaderProps) {
  const { logout, user } = useAuth();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const displayEmail = user?.email || 'user@example.com';
  const displayName = displayEmail.split('@')[0] || 'User';
  const avatarLetter = displayName.charAt(0).toUpperCase();

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

  const handleNavigate = (navId: string) => {
    onNavigate(navId);
    setOpen(false);
  };

  return (
    <header className={styles.header}>
      {/* -- Left: sidebar toggle -- */}
      <button
        className={styles.toggleBtn}
        onClick={onMenuToggle}
        aria-label="Toggle navigation"
      >
        <MenuIcon />
      </button>

      {/* -- Center: page title -- */}
      <div className={styles.titleArea}>
        <span className={styles.pageTitleText}>{pageTitle}</span>
      </div>

      {/* -- Right: notification bell + user profile -- */}
      <div className={styles.headerActions}>
        <NotificationDropdown />

        {/* -- User profile button -- */}
        <div className={styles.userArea} ref={containerRef}>
          <button
            className={`${styles.userBtn} ${open ? styles.userBtnOpen : ''}`}
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-haspopup="menu"
            aria-label="Open user menu"
          >
            <div className={styles.avatar}>{avatarLetter}</div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{displayName}</span>
              <span className={styles.userRole}>User</span>
            </div>
            <span className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}>
              <ChevronDownIcon />
            </span>
          </button>

          {/* -- Dropdown menu -- */}
          {open && (
            <div className={styles.dropdown} role="menu" aria-label="User menu">
              {/* Profile header */}
              <div className={styles.dropdownHeader}>
                <div className={styles.dropdownAvatar}>{avatarLetter}</div>
                <div className={styles.dropdownHeaderText}>
                  <span className={styles.dropdownName}>{displayName}</span>
                  <span className={styles.dropdownEmail}>{displayEmail}</span>
                </div>
              </div>

              <div className={styles.dropdownDivider} />

              <button
                className={styles.dropdownItem}
                role="menuitem"
                onClick={() => handleNavigate('profile')}
              >
                <UserCircleIcon />
                <span>My Account</span>
              </button>

              <button
                className={styles.dropdownItem}
                role="menuitem"
                onClick={() => handleNavigate('settings')}
              >
                <SettingsMenuIcon />
                <span>Settings</span>
              </button>

              <div className={styles.dropdownDivider} />

              <button
                className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`}
                role="menuitem"
                onClick={async () => {
                  setOpen(false);
                  await logout();
                }}
              >
                <LogoutMenuIcon />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

/* -- SVG Icons --------------------------------------------- */
function MenuIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function UserCircleIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function SettingsMenuIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  );
}

function LogoutMenuIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}
