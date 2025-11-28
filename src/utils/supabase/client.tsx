import { createClient } from '@supabase/supabase-js@2.49.2';
import { projectId, publicAnonKey } from './info';

const supabaseUrl = `https://${projectId}.supabase.co`;

// Declaración para TypeScript
declare global {
  interface Window {
    __supabaseClient?: ReturnType<typeof createClient>;
  }
}

// Crear una única instancia singleton del cliente de Supabase
// Usar window para persistir la instancia a través de HMR (Hot Module Replacement)
export function getSupabaseClient() {
  if (typeof window !== 'undefined' && !window.__supabaseClient) {
    window.__supabaseClient = createClient(supabaseUrl, publicAnonKey, {
      auth: {
        storageKey: 'ferreteria-auth-token',
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false
      }
    });
  }
  return window.__supabaseClient!;
}
