import { useState, useRef, useEffect, ChangeEvent } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import styles from './ProfileForm.module.css';

/* ── Password strength helper ───────────────────────────── */
function getStrength(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const levels: Array<{ label: string; color: string }> = [
    { label: 'Very weak', color: '#ef4444' },
    { label: 'Weak', color: '#f97316' },
    { label: 'Fair', color: '#eab308' },
    { label: 'Good', color: '#22c55e' },
    { label: 'Strong', color: '#10b981' },
  ];
  return { score, ...levels[score] };
}

/* ── Component ──────────────────────────────────────────── */
export default function ProfileForm() {
  const { user, profile, profileLoading, updateProfile, uploadAvatarFile, clearAvatar } = useAuth();

  /* Profile info */
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [nameError, setNameError] = useState('');

  /* Avatar */
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  /* Password */
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwErrors, setPwErrors] = useState<Record<string, string>>({});

  /* UX */
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [toastError, setToastError] = useState(false);

  /* Seed form from Supabase profile */
  useEffect(() => {
    if (profile) {
      setName(profile.full_name ?? '');
      setPhone(profile.phone ?? '');
      setAvatarSrc(profile.avatar_url ?? null);
    }
  }, [profile]);

  /* ── Avatar handlers ── */
  const handleAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarError('');
    setAvatarUploading(true);
    const localPreview = URL.createObjectURL(file);
    setAvatarSrc(localPreview);
    const { url, error } = await uploadAvatarFile(file);
    URL.revokeObjectURL(localPreview);
    if (error || !url) {
      setAvatarSrc(profile?.avatar_url ?? null);
      setAvatarError(error ?? 'Upload failed. Please try again.');
    } else {
      setAvatarSrc(url);
      showToast('Profile photo updated.', false);
    }
    setAvatarUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleRemoveAvatar = async () => {
    setAvatarUploading(true);
    const { error } = await clearAvatar();
    setAvatarUploading(false);
    if (error) {
      showToast('Failed to remove photo: ' + error, true);
    } else {
      setAvatarSrc(null);
      showToast('Profile photo removed.', false);
    }
  };

  /* ── Profile info save ── */
  const handleProfileSave = async () => {
    if (!name.trim()) {
      setNameError('Name is required.');
      return;
    }
    setNameError('');
    setSaving(true);
    const { error } = await updateProfile({ full_name: name.trim(), phone: phone.trim() || null });
    setSaving(false);
    if (error) {
      showToast('Failed to save: ' + error, true);
    } else {
      showToast('Profile updated successfully.', false);
    }
  };

  /* ── Password save ── */
  const handlePasswordSave = async () => {
    const errors: Record<string, string> = {};
    if (!currentPw) errors.current = 'Current password is required.';
    if (!newPw) errors.new = 'New password is required.';
    else if (newPw.length < 8) errors.new = 'Password must be at least 8 characters.';
    if (!confirmPw) errors.confirm = 'Please confirm your new password.';
    else if (newPw && confirmPw !== newPw) errors.confirm = 'Passwords do not match.';
    if (Object.keys(errors).length) { setPwErrors(errors); return; }

    setPwErrors({});
    setSaving(true);

    // Verify current password via re-authentication
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: user?.email ?? '',
      password: currentPw,
    });
    if (authError) {
      setPwErrors({ current: 'Current password is incorrect.' });
      setSaving(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({ password: newPw });
    setSaving(false);
    if (updateError) {
      showToast('Failed to update password: ' + updateError.message, true);
    } else {
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
      showToast('Password updated successfully.', false);
    }
  };

  const showToast = (msg: string, isError: boolean) => {
    setToast(msg);
    setToastError(isError);
    setTimeout(() => setToast(''), 3500);
  };

  const strength = getStrength(newPw);
  const displayEmail = user?.email ?? profile?.email ?? '';
  const displayInitial = (profile?.full_name ?? displayEmail ?? 'U')[0].toUpperCase();

  if (profileLoading) {
    return (
      <div className={styles.page}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#94a3b8', padding: '2rem 0' }}>
          <SpinnerIcon />
          <span>Loading profile…</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div>
        <h1 className={styles.pageTitle}>My Account</h1>
        <p className={styles.pageSubtitle}>Manage your personal information and account security.</p>
      </div>

      {toast && (
        <div
          className={styles.toast}
          role="status"
          style={toastError ? { background: '#fef2f2', color: '#dc2626', borderColor: '#fecaca' } : undefined}
        >
          {toastError ? <XCircleIcon /> : <CheckCircleIcon />}
          {toast}
        </div>
      )}

      {/* ══ Card 1 — Avatar + Profile Info ══ */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardHeaderIcon}><UserIcon /></div>
          <div className={styles.cardHeaderText}>
            <span className={styles.cardTitle}>Profile Information</span>
            <span className={styles.cardDesc}>Update your display name, phone, and photo</span>
          </div>
        </div>

        <div className={styles.cardBody}>
          {/* Avatar row */}
          <div className={styles.avatarSection}>
            <div className={styles.avatarWrap}>
              <div className={styles.avatar}>
                {avatarSrc ? <img src={avatarSrc} alt="Profile photo" /> : displayInitial}
              </div>
              {avatarUploading ? (
                <div className={styles.avatarOverlay} style={{ cursor: 'default' }}><SpinnerIcon /></div>
              ) : (
                <label htmlFor="avatar-input" className={styles.avatarOverlay} aria-label="Upload new photo">
                  <CameraIcon />
                </label>
              )}
              <input
                id="avatar-input" ref={fileRef} type="file"
                accept="image/png, image/jpeg, image/webp"
                className={styles.fileInput}
                onChange={handleAvatarChange}
                disabled={avatarUploading}
              />
            </div>
            <div className={styles.avatarMeta}>
              <label
                htmlFor="avatar-input" className={styles.uploadBtn}
                style={avatarUploading ? { opacity: 0.5, pointerEvents: 'none' } : undefined}
              >
                <UploadIcon />
                {avatarUploading ? 'Uploading…' : 'Upload photo'}
              </label>
              {avatarSrc && !avatarUploading && (
                <button className={styles.removeBtn} onClick={handleRemoveAvatar} type="button">
                  <TrashIcon />Remove
                </button>
              )}
              <span className={styles.avatarHint}>JPG, PNG or WebP. Max 2 MB.<br />Recommended 200×200 px.</span>
              {avatarError && <span style={{ color: '#dc2626', fontSize: 12 }}>{avatarError}</span>}
            </div>
          </div>

          {/* Fields */}
          <div className={styles.formGrid} style={{ marginTop: 24 }}>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="field-name">
                Full name <span className={styles.required}>*</span>
              </label>
              <div className={styles.inputWrap}>
                <input
                  id="field-name"
                  className={`${styles.input} ${nameError ? styles.inputError : ''}`}
                  type="text" value={name}
                  onChange={(e) => { setName(e.target.value); setNameError(''); }}
                  placeholder="Your full name"
                />
              </div>
              {nameError && <span className={styles.fieldError}>{nameError}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="field-email">Email address</label>
              <div className={styles.inputWrap}>
                <input
                  id="field-email" className={styles.input} type="email"
                  value={displayEmail} readOnly
                  style={{ color: '#94a3b8', cursor: 'not-allowed' }}
                />
                <span className={styles.inputAddon}><LockIcon /></span>
              </div>
              <span className={styles.fieldHint}>Email is managed by Supabase Auth.</span>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="field-phone">Phone number</label>
              <div className={styles.inputWrap}>
                <input
                  id="field-phone" className={styles.input} type="tel"
                  value={phone} onChange={(e) => setPhone(e.target.value)}
                  placeholder="+966 5x xxx xxxx"
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="field-role">Role</label>
              <div className={styles.inputWrap}>
                <input
                  id="field-role" className={styles.input} type="text"
                  value="Administrator" readOnly
                  style={{ color: '#94a3b8', cursor: 'not-allowed' }}
                />
                <span className={styles.inputAddon}><LockIcon /></span>
              </div>
              <span className={styles.fieldHint}>Role is managed by the system.</span>
            </div>
          </div>
        </div>

        <div className={styles.cardFooter}>
          <button className={styles.cancelBtn} type="button"
            onClick={() => { setName(profile?.full_name ?? ''); setPhone(profile?.phone ?? ''); setNameError(''); }}>
            Cancel
          </button>
          <button className={styles.saveBtn} type="button" onClick={handleProfileSave} disabled={saving}>
            {saving ? <SpinnerIcon /> : <SaveIcon />}Save changes
          </button>
        </div>
      </div>

      {/* ══ Card 2 — Change Password ══ */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardHeaderIcon} style={{ background: '#fef3c7', color: '#d97706' }}><ShieldIcon /></div>
          <div className={styles.cardHeaderText}>
            <span className={styles.cardTitle}>Security</span>
            <span className={styles.cardDesc}>Change your password to keep your account safe</span>
          </div>
        </div>

        <div className={styles.cardBody}>
          <div className={styles.formGrid}>
            <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
              <label className={styles.label} htmlFor="field-current-pw">
                Current password <span className={styles.required}>*</span>
              </label>
              <div className={styles.inputWrap}>
                <input
                  id="field-current-pw"
                  className={`${styles.input} ${pwErrors.current ? styles.inputError : ''}`}
                  type={showCurrent ? 'text' : 'password'} value={currentPw}
                  onChange={(e) => { setCurrentPw(e.target.value); setPwErrors((p) => ({ ...p, current: '' })); }}
                  placeholder="Enter current password" style={{ paddingRight: 44 }}
                />
                <button type="button" className={styles.eyeBtn} onClick={() => setShowCurrent((v) => !v)}
                  aria-label={showCurrent ? 'Hide password' : 'Show password'}>
                  {showCurrent ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {pwErrors.current && <span className={styles.fieldError}>{pwErrors.current}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="field-new-pw">
                New password <span className={styles.required}>*</span>
              </label>
              <div className={styles.inputWrap}>
                <input
                  id="field-new-pw"
                  className={`${styles.input} ${pwErrors.new ? styles.inputError : ''}`}
                  type={showNew ? 'text' : 'password'} value={newPw}
                  onChange={(e) => { setNewPw(e.target.value); setPwErrors((p) => ({ ...p, new: '' })); }}
                  placeholder="8+ characters" style={{ paddingRight: 44 }}
                />
                <button type="button" className={styles.eyeBtn} onClick={() => setShowNew((v) => !v)}
                  aria-label={showNew ? 'Hide password' : 'Show password'}>
                  {showNew ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {pwErrors.new && <span className={styles.fieldError}>{pwErrors.new}</span>}
              {newPw && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div className={styles.strengthBar}>
                    <div className={styles.strengthFill}
                      style={{ width: `${(strength.score / 4) * 100}%`, background: strength.color }} />
                  </div>
                  <span className={styles.strengthLabel} style={{ color: strength.color }}>{strength.label}</span>
                </div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="field-confirm-pw">
                Confirm new password <span className={styles.required}>*</span>
              </label>
              <div className={styles.inputWrap}>
                <input
                  id="field-confirm-pw"
                  className={`${styles.input} ${pwErrors.confirm ? styles.inputError : ''}`}
                  type={showConfirm ? 'text' : 'password'} value={confirmPw}
                  onChange={(e) => { setConfirmPw(e.target.value); setPwErrors((p) => ({ ...p, confirm: '' })); }}
                  placeholder="Re-enter new password" style={{ paddingRight: 44 }}
                />
                <button type="button" className={styles.eyeBtn} onClick={() => setShowConfirm((v) => !v)}
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}>
                  {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {pwErrors.confirm && <span className={styles.fieldError}>{pwErrors.confirm}</span>}
            </div>
          </div>
        </div>

        <div className={styles.cardFooter}>
          <button className={styles.cancelBtn} type="button"
            onClick={() => { setCurrentPw(''); setNewPw(''); setConfirmPw(''); setPwErrors({}); }}>
            Cancel
          </button>
          <button className={styles.saveBtn} type="button" onClick={handlePasswordSave} disabled={saving}>
            {saving ? <SpinnerIcon /> : <SaveIcon />}Update password
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── SVG Icons ───────────────────────────────────────────── */
function UserIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}
function CameraIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" /><circle cx="12" cy="13" r="4" />
    </svg>
  );
}
function UploadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3" />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
    </svg>
  );
}
function LockIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  );
}
function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function EyeOffIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}
function SaveIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
    </svg>
  );
}
function CheckCircleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
function XCircleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}
function SpinnerIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      style={{ animation: 'spin 0.8s linear infinite' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}
