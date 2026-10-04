import { createClient, SupabaseClient } from '@supabase/supabase-js';

const rawSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseUrl = rawSupabaseUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');

// Ưu tiên Server Secret Key (service_role), nếu chưa có thì dùng Publishable/Anon key
const supabaseSecretKey =
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';

export const isServerSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseSecretKey &&
    supabaseUrl !== 'https://your-project.supabase.co' &&
    !supabaseUrl.includes('placeholder')
  );
};

let cachedAdminClient: SupabaseClient | null = null;

/**
 * Trả về Supabase client cho Server Side API.
 * Tự động dùng Service Role Key nếu có để bỏ qua RLS cho các tác vụ quản trị (User CRUD, System Settings).
 */
export function getServerSupabase(): SupabaseClient | null {
  if (!isServerSupabaseConfigured()) return null;
  if (cachedAdminClient) return cachedAdminClient;

  cachedAdminClient = createClient(supabaseUrl, supabaseSecretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return cachedAdminClient;
}
