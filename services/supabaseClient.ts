import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rhedtlrqrectrhzajlrl.supabase.co';
const supabaseKey = 'sb_publishable_AEz8kLotoz-w450s73qEkA_ySEdwsUP';

export const supabase = createClient(supabaseUrl, supabaseKey); 