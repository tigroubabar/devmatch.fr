import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://ydycfgsglxutfsojymnn.supabase.co";
const SUPABASE_KEY = "sb_publishable_C2HQwWuYNn1x7OzoQVdjNw_5qp_eAZ1";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
