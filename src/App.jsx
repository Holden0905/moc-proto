import { getMocLabel } from "./utils/moc";
import { safeText } from "./utils/text";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabaseClient";
import { fetchMocs } from "./api/mocs";
import { fetchEnvReviewByMoc } from "./api/envReviews";




export default function App() {
  // --- MOCs ---
  const [mocs, setMocs] = useState([]);
  const [selectedMoc, setSelectedMoc] = useState(null);
  const [loadingMocs, setLoadingMocs] = useState(true);
  const [errorMocs, setErrorMocs] = useState(null);

  // --- Reviews ---
  const [envReviews, setEnvReviews] = useState([]);
  const [selectedReview, setSelectedReview] = useState(null);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [errorReviews, setErrorReviews] = useState(null);

  // --- Create review ---
  const [creatingReview, setCreatingReview] = useState(false);
  const [createError, setCreateError] = useState(null);

  // --- Save review ---
  const [savingReview, setSavingReview] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // --- Editable fields for the selected review ---
  const [editStatus, setEditStatus] = useState("");
  const [editReviewer, setEditReviewer] = useState("");

  const hasReview = useMemo(() => envReviews.length > 0, [envReviews]);

  // 1) Load MOCs on first mount
  useEffect(() => {
    let ignore = false;

    async function loadMocs() {
      setLoadingMocs(true);
      setErrorMocs(null);

      let data = [];
      let error = null;

      try {
      data = await fetchMocs();
      } catch (e) {
      error = e;
      }


      if (ignore) return;

      if (error) {
        setErrorMocs(error.message);
        setMocs([]);
        setSelectedMoc(null);
      } else {
        setMocs(data || []);
        // Auto-select first MOC (optional)
        if ((data || []).length > 0) setSelectedMoc((prev) => prev ?? data[0]);
      }

      setLoadingMocs(false);
    }

    loadMocs();

    return () => {
      ignore = true;
    };
  }, []);

  // 2) Load env_reviews whenever selectedMoc changes
  useEffect(() => {
    let ignore = false;

    async function loadReviewsForMoc() {
      if (!selectedMoc?.id) {
        setEnvReviews([]);
        setSelectedReview(null);
        return;
      }

      setLoadingReviews(true);
      setErrorReviews(null);

      let review = null;
      let error = null;

      try {
        review = await fetchEnvReviewByMoc(selectedMoc.id);
      } catch (e) {
        error = e;
      }

      if (ignore) return;

      if (error) {
        setErrorReviews(error.message);
        setEnvReviews([]);
        setSelectedReview(null);
      } else {
        setEnvReviews(review ? [review] : []);
        setSelectedReview(review);
      }


        setLoadingReviews(false);
      }

    loadReviewsForMoc();

    return () => {
      ignore = true;
    };
  }, [selectedMoc]);

  // 3) When selectedReview changes, hydrate editable fields
  useEffect(() => {
    setEditStatus(safeText(selectedReview?.env_status));
    setEditReviewer(safeText(selectedReview?.env_reviewer));
  }, [selectedReview]);

  // 4) Start vs Continue Review button
  async function handleStartOrContinueReview() {
    if (!selectedMoc?.id) return;

    setCreateError(null);

    // Continue: select existing
    if (envReviews.length > 0) {
      setSelectedReview(envReviews[0]);
      return;
    }

    // Start: insert new
    try {
      setCreatingReview(true);

      const payload = {
        moc_id: selectedMoc.id,
        env_status: "Not Reviewed",
        // If you have a start date column and want it set now, uncomment:
        // env_review_start_date: new Date().toISOString(),
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

  // 5) Save edits to selected review
  async function handleSaveReview() {
    if (!selectedReview?.id) return;

    setSaveError(null);

    try {
      setSavingReview(true);

      const updates = {
        env_status: editStatus || null,
        env_reviewer: editReviewer || null,
      };

      const { data, error } = await supabase
        .from("env_reviews")
        .update(updates)
        .eq("id", selectedReview.id)
        .select("*")
        .single();

      if (error) throw error;

      // update local lists
      setSelectedReview(data);
      setEnvReviews((prev) => prev.map((r) => (r.id === data.id ? data : r)));
    } catch (e) {
      setSaveError(e?.message ?? "Failed to save review");
    } finally {
      setSavingReview(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", padding: 20, fontFamily: "system-ui, Arial" }}>
      <h1 style={{ marginTop: 0 }}>MOC List</h1>

      <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 16 }}>
        {/* LEFT: MOC List */}
        <div style={{ border: "1px solid #333", borderRadius: 8, padding: 12 }}>
          <h2 style={{ marginTop: 0, fontSize: 18 }}>MOCs</h2>

          {loadingMocs && <div>Loading MOCs…</div>}
          {errorMocs && (
            <div style={{ color: "salmon" }}>
              <b>Error:</b> {errorMocs}
            </div>
          )}

          {!loadingMocs && !errorMocs && (
            <div style={{ maxHeight: "70vh", overflow: "auto" }}>
              {mocs.map((moc) => {
                const active = selectedMoc?.id === moc.id;
                return (
                  <button
                    key={moc.id}
                    onClick={() => setSelectedMoc(moc)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "10px 10px",
                      marginBottom: 8,
                      borderRadius: 8,
                      border: active ? "2px solid #fff" : "1px solid #444",
                      background: active ? "#222" : "#111",
                      color: "#fff",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ fontWeight: 700 }}>{getMocLabel(moc)}</div>
                    <div style={{ opacity: 0.8, fontSize: 12 }}>
                      Location: {safeText(moc.location || moc["Location"] || "")}
                    </div>
                  </button>
                );
              })}

              {mocs.length === 0 && <div>No MOCs found.</div>}
            </div>
          )}
        </div>

        {/* RIGHT: Review Panel */}
        <div style={{ border: "1px solid #333", borderRadius: 8, padding: 12 }}>
          <h2 style={{ marginTop: 0, fontSize: 18 }}>
            Review{" "}
            <span style={{ opacity: 0.7, fontWeight: 400 }}>
              — {selectedMoc ? getMocLabel(selectedMoc) : "(select a MOC)"}
            </span>
          </h2>

          {/* Start/Continue */}
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
            <button
              onClick={handleStartOrContinueReview}
              disabled={!selectedMoc || creatingReview || loadingReviews}
              style={{
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid #444",
                background: "#111",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              {creatingReview ? "Working…" : hasReview ? "Continue review" : "Start review"}
            </button>

            {loadingReviews && <span>Loading review…</span>}
            {createError && (
              <span style={{ color: "salmon" }}>
                <b>Error:</b> {createError}
              </span>
            )}
            {errorReviews && (
              <span style={{ color: "salmon" }}>
                <b>Error:</b> {errorReviews}
              </span>
            )}
          </div>

          {/* Review detail */}
          {!selectedReview ? (
            <div style={{ opacity: 0.8 }}>
              No review selected. Click <b>Start review</b> to create one.
            </div>
          ) : (
            <div style={{ display: "grid", gap: 12, maxWidth: 520 }}>
              <div style={{ fontSize: 13, opacity: 0.8 }}>
                <div>
                  <b>Review ID:</b> {selectedReview.id}
                </div>
                <div>
                  <b>Created:</b> {safeText(selectedReview.created_at)}
                </div>
              </div>

              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ fontWeight: 700 }}>env_status</span>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  style={{
                    padding: 10,
                    borderRadius: 8,
                    border: "1px solid #444",
                    background: "#0f0f0f",
                    color: "#fff",
                  }}
                >
                  <option value="">(blank)</option>
                  <option value="Not Reviewed">Not Reviewed</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </label>

              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ fontWeight: 700 }}>env_reviewer</span>
                <input
                  value={editReviewer}
                  onChange={(e) => setEditReviewer(e.target.value)}
                  placeholder="Name"
                  style={{
                    padding: 10,
                    borderRadius: 8,
                    border: "1px solid #444",
                    background: "#0f0f0f",
                    color: "#fff",
                  }}
                />
              </label>

              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <button
                  onClick={handleSaveReview}
                  disabled={savingReview}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1px solid #444",
                    background: "#111",
                    color: "#fff",
                    cursor: "pointer",
                  }}
                >
                  {savingReview ? "Saving…" : "Save"}
                </button>

                {saveError && (
                  <span style={{ color: "salmon" }}>
                    <b>Error:</b> {saveError}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: 18, fontSize: 12, opacity: 0.7 }}>
        Tip: If your MOC columns have spaces (like “MOC ID”), that’s okay — this file handles it. Later we can normalize
        column names for sanity.
      </div>
    </div>
  );
}



