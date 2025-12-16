import { supabase } from "../supabaseClient";

export async function fetchEnvReviewByMoc(mocId) {
  const { data, error } = await supabase
    .from("env_reviews")
    .select("*")
    .eq("moc_id", mocId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle(); // one review per MOC

  if (error) throw error;
  return data ?? null;
}


