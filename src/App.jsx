import { Buffer } from 'buffer';
window.Buffer = Buffer;
import React, { useState } from "react";
import { useMocs } from "./hooks/useMocs";
import { useEnvReview } from "./hooks/useEnvReview";
import MOCList from "./components/MocList";
import ReviewPanel from "./components/ReviewPanel";
import ImportMOCs from "./components/ImportMOCs";
import MocSummary from "./components/MocSummary"; // <--- 1. NEW IMPORT

// ... leave the rest of the file alone (e.g., import React, import App, etc.)

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
  <div style={{ 
    border: "1px solid #333", 
    borderRadius: 8, 
    padding: 12,
    background: "#111",
    color: "#eee",
    // CHANGED:
    height: "100%",        // Forces it to fill the height provided by the parent
    boxSizing: "border-box" // Ensures padding doesn't mess up the height
  }}>
      
      {/* HEADER SECTION WITH LOGO */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 30 }}>
        <img
          src="/logo.png" // This looks inside the 'public' folder
          alt="Stepan Logo"
          style={{ height: "55px", marginRight: "20px" }}
        />
        <div>
          <h1 style={{ marginTop: 0, marginBottom: 0, lineHeight: "1.1" }}>
            Stepan Air Department
          </h1>
          <h2 style={{ marginTop: 4, marginBottom: 0, fontWeight: "normal", opacity: 0.8, fontSize: "1.4rem", lineHeight: "1.1" }}>
            MOC Review
          </h2>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 16 }}>
        {/* LEFT COLUMN: MOC List */}
        <MOCList
          mocs={mocs}
          loading={loadingMocs}
          error={errorMocs}
          selectedMoc={selectedMoc}
          onSelectMoc={setSelectedMoc}
        />

        {/* RIGHT COLUMN: Container for Summary + Review */}
        {/* 2. New Flex Container to hold Summary and Panel side-by-side */}
        <div style={{ display: "flex", gap: 16, alignItems: "stretch" }}>
          
          {/* MOC Summary - Only show if a MOC is selected */}
          {selectedMoc && (
            <div style={{ flex: "0 0 400px" }}> {/* Fixed width of 400px */}
              <MocSummary moc={selectedMoc} />
            </div>
          )}

          {/* Review Panel - Takes remaining width */}
          <div style={{ flex: 1 }}>
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

        </div>
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