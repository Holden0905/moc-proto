import { supabase } from "../supabaseClient";

export async function fetchMocs() {
  const { data, error } = await supabase.from("mocs").select("*");
  if (error) throw error;
  return data ?? [];
}

