import { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabaseClient";
import { fetchEnvReviewByMoc } from "../api/envReviews";

export function useEnvReview(selectedMoc) {
  // We keep an array for compatibility with your current UI,
  // but it will be 0 or 1 item (one review per MOC).
  const [envReviews, setEnvReviews] = useState([]);
  const [selectedReview, setSelectedReview] = useState(null);

  const [loadingReviews, setLoadingReviews] = useState(false);
  const [errorReviews, setErrorReviews] = useState(null);

  const [creatingReview, setCreatingReview] = useState(false);
  const [createError, setCreateError] = useState(null);

  const hasReview = useMemo(() => envReviews.length > 0, [envReviews]);

  // Load (0 or 1) review whenever selectedMoc changes
  useEffect(() => {
    let ignore = false;

    async function load() {
      if (!selectedMoc?.id) {
        setEnvReviews([]);
        setSelectedReview(null);
        return;
      }

      setLoadingReviews(true);
      setErrorReviews(null);

      try {
        const review = await fetchEnvReviewByMoc(selectedMoc.id);
        if (ignore) return;

        const rows = review ? [review] : [];
        setEnvReviews(rows);
        setSelectedReview(review ?? null);
      } catch (e) {
        if (ignore) return;
        setErrorReviews(e?.message ?? "Failed to load review");
        setEnvReviews([]);
        setSelectedReview(null);
      } finally {
        if (!ignore) setLoadingReviews(false);
      }
    }

    load();

    return () => {
      ignore = true;
    };
  }, [selectedMoc?.id]);

  // Start vs Continue
  async function startOrContinueReview() {
    if (!selectedMoc?.id) return;

    setCreateError(null);

    // Continue
    if (envReviews.length > 0) {
      setSelectedReview(envReviews[0]);
      return;
    }

    // Start (create one)
    try {
      setCreatingReview(true);

      const payload = {
        moc_id: selectedMoc.id,
        env_status: "Not Reviewed",
      };

      const { data, error } = await supabase
        .from("env_reviews")
        .insert([payload])
        .select("*")
        .single();

      if (error) throw error;

      setEnvReviews([data]);
      setSelectedReview(data);
    } catch (e) {
      setCreateError(e?.message ?? "Failed to start review");
    } finally {
      setCreatingReview(false);
    }
  }

  return {
    envReviews,
    setEnvReviews,
    selectedReview,
    setSelectedReview,

    hasReview,
    loadingReviews,
    errorReviews,

    creatingReview,
    createError,

    startOrContinueReview,
  };
}
