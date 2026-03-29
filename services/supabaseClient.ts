import { createClient } from '@supabase/supabase-js';

type SupabaseBrowserConfig = {
  url: string;
  key: string;
};

const legacyConfig: SupabaseBrowserConfig = {
  url: import.meta.env.VITE_SUPABASE_LEGACY_URL || 'https://rhedtlrqrectrhzajlrl.supabase.co',
  key: import.meta.env.VITE_SUPABASE_LEGACY_PUBLISHABLE_KEY || 'sb_publishable_AEz8kLotoz-w450s73qEkA_ySEdwsUP',
};

const primaryConfig: SupabaseBrowserConfig = {
  url: import.meta.env.VITE_SUPABASE_URL || legacyConfig.url,
  key: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || legacyConfig.key,
};

function createBrowserSupabaseClient(config: SupabaseBrowserConfig, label: string) {
  if (!config.url || !config.key) {
    throw new Error(`Missing ${label} Supabase browser configuration.`);
  }

  return createClient(config.url, config.key, {
    auth: {
      storageKey: `sb-${label}-auth-token`,
    },
  });
}

export const supabase = createBrowserSupabaseClient(primaryConfig, 'primary');

export const legacySupabase =
  primaryConfig.url === legacyConfig.url && primaryConfig.key === legacyConfig.key
    ? supabase
    : createBrowserSupabaseClient(legacyConfig, 'legacy');

export const supabaseClients = {
  primary: supabase,
  legacy: legacySupabase,
};
