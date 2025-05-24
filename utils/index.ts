// import { createClient } from "@supabase/supabase-js";
// const runtime = useRuntimeConfig();
// const supabaseUrl = runtime.supabaseUrl;
// const supabasekey = runtime.supabaseAnonKey;
//
// export const supabase = createClient(supabaseUrl, supabasekey);
export const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount);
};
