import React, { useState } from "react";
import { useMocs } from "./hooks/useMocs";
import { useEnvReview } from "./hooks/useEnvReview";
import MOCList from "./components/MocList";
import ReviewPanel from "./components/ReviewPanel";
import ImportMOCs from "./components/ImportMOCs";

export default function App() {
  // State for toggling the import box
  const [showImport, setShowImport] = useState(false);

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
      
      {/* HEADER - Just the Title now */}
      <h1 style={{ marginTop: 0, marginBottom: 20 }}>MOC List</h1>

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

      {/* FOOTER AREA - Import Button is now here */}
      <div style={{ marginTop: 40, paddingTop: 20, borderTop: "1px solid #eee" }}>
        <button 
          onClick={() => setShowImport(!showImport)}
          style={{ padding: "8px 16px", cursor: "pointer", opacity: 0.8 }}
        >
          {showImport ? 'Close Importer' : 'Import Excel File'}
        </button>

        {/* IMPORT COMPONENT (Shows below button when clicked) */}
        {showImport && (
          <div style={{ marginTop: 20, maxWidth: "500px" }}>
            <ImportMOCs onUploadSuccess={() => window.location.reload()} />
          </div>
        )}
      </div>

    </div>
  );
}