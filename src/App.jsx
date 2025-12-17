import { useMocs } from "./hooks/useMocs";
import { useEnvReview } from "./hooks/useEnvReview";
import MOCList from "./components/MocList";
import ReviewPanel from "./components/ReviewPanel";

export default function App() {
  // --- MOCs (hook) ---
  const { mocs, selectedMoc, setSelectedMoc, loadingMocs, errorMocs } = useMocs();

  // --- Review (hook) ---
  const {
    envReviews,
    setEnvReviews,
    selectedReview,
    setSelectedReview,
    loadingReviews,
    errorReviews,
    creatingReview,
    createError,
    startOrContinueReview,
  } = useEnvReview(selectedMoc);

  // Callback: When ReviewPanel saves a review, it calls this to update our list
  function handleReviewUpdate(updatedReview) {
    setSelectedReview(updatedReview);
    // Update the item in the list if it exists
    setEnvReviews((prev) => prev.map((r) => (r.id === updatedReview.id ? updatedReview : r)));
  }

  return (
    <div style={{ minHeight: "100vh", padding: 20, fontFamily: "system-ui, Arial" }}>
      <h1 style={{ marginTop: 0 }}>MOC List</h1>

      <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 16 }}>
        {/* LEFT: MOC List */}
        <MOCList
          mocs={mocs}
          loading={loadingMocs}
          error={errorMocs}
          selectedMoc={selectedMoc}
          onSelectMoc={setSelectedMoc}
        />

        {/* RIGHT: Review Panel */}
        <ReviewPanel
          selectedMoc={selectedMoc}
          selectedReview={selectedReview}
          startOrContinueReview={startOrContinueReview}
          loadingReviews={loadingReviews}
          creatingReview={creatingReview}
          createError={createError}
          errorReviews={errorReviews}
          onReviewUpdated={handleReviewUpdate}
        />
      </div>

      <div style={{ marginTop: 18, fontSize: 12, opacity: 0.7 }}>
        Tip: If your MOC columns have spaces (like “MOC ID”), that’s okay — this file handles it. Later we can normalize
        column names for sanity.
      </div>
    </div>
  );
}