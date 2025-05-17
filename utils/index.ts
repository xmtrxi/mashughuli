import { createClient } from "@supabase/supabase-js";
const runtime = useRuntimeConfig();
const supabaseUrl = runtime.supabaseUrl;
const supabasekey = runtime.supabaseAnonKey;

export const supabase = createClient(supabaseUrl, supabasekey);
