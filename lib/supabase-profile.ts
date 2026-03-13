import { supabase } from './supabase';

const AVATAR_BUCKET = 'avatars';

/* ── Types ───────────────────────────────────────────────── */

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export type ProfileUpdate = {
  full_name?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
};

/* ── Profile CRUD ────────────────────────────────────────── */

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    // PGRST116 = no row found (profile not yet created)
    if (error.code !== 'PGRST116') {
      console.error('[supabase-profile] getProfile:', error.message);
    }
    return null;
  }

  return data as Profile;
}

export async function upsertProfile(
  userId: string,
  updates: ProfileUpdate
): Promise<{ error: string | null }> {
  const { error } = await supabase.from('profiles').upsert({
    id: userId,
    ...updates,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.error('[supabase-profile] upsertProfile:', error.message);
    return { error: error.message };
  }

  return { error: null };
}

/* ── Avatar upload ───────────────────────────────────────── */

const MAX_AVATAR_BYTES = 2 * 1024 * 1024; // 2 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function uploadAvatar(
  userId: string,
  file: File
): Promise<{ url: string | null; error: string | null }> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { url: null, error: 'Only JPG, PNG, or WebP images are allowed.' };
  }
  if (file.size > MAX_AVATAR_BYTES) {
    return { url: null, error: 'Image must be 2 MB or smaller.' };
  }

  const ext = file.name.split('.').pop() ?? 'jpg';
  // Store as userId/avatar.<ext> — upsert replaces the old file
  const path = `${userId}/avatar.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) {
    console.error('[supabase-profile] uploadAvatar:', uploadError.message);
    return { url: null, error: uploadError.message };
  }

  const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
  // Cache-bust so the browser doesn't serve the stale image after a re-upload
  const url = `${data.publicUrl}?t=${Date.now()}`;
  return { url, error: null };
}

export async function removeAvatar(userId: string): Promise<void> {
  // Try to remove all common extensions; ignore errors (best-effort cleanup)
  const paths = ['jpg', 'jpeg', 'png', 'webp'].map((ext) => `${userId}/avatar.${ext}`);
  await supabase.storage.from(AVATAR_BUCKET).remove(paths);
}
