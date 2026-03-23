import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://w450s73qeka_yse.supabase.co'; // Replace with your actual Supabase project URL if different
const supabaseKey = 'sb_publishable_AEz8kLotoz-w450s73qEkA_ySEdwsUP';

export const supabase = createClient(supabaseUrl, supabaseKey); 