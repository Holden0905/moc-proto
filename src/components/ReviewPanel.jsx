import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { getMocLabel } from "../utils/moc";
import { safeText } from "../utils/text";
import { PDFDownloadLink } from '@react-pdf/renderer';
import ReviewPdfDocument from './ReviewPdfDocument';

export default function ReviewPanel({
  selectedMoc,
  selectedReview,
  startOrContinueReview,
  loadingReviews,
  creatingReview,
  createError,
  errorReviews,
  onReviewUpdated,
}) {
  // --- Local State for Editing ---
  const [editStatus, setEditStatus] = useState("");
  const [editReviewer, setEditReviewer] = useState("");
  const [editComments, setEditComments] = useState("");

  // Dates
  const [startDate, setStartDate] = useState("");
  const [completeDate, setCompleteDate] = useState("");

  // Questions
  const [modifyLdar, setModifyLdar] = useState("");
  const [modifyControl, setModifyControl] = useState("");
  const [increaseProcess, setIncreaseProcess] = useState("");
  const [outsideSource, setOutsideSource] = useState("");
  const [permitting, setPermitting] = useState("");

  const [savingReview, setSavingReview] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // Helper: Convert "2025-12-16T15:30:00+00" -> "2025-12-16"
  function toInputDate(isoString) {
    if (!isoString) return "";
    return isoString.split("T")[0];
  }

  // Helper: Convert string "true"/"false" -> boolean/null
  function stringToBool(val) {
    if (val === "true") return true;
    if (val === "false") return false;
    return null;
  }

  // Helper: Convert boolean -> string "true"/"false"
  function boolToString(val) {
    if (val === true) return "true";
    if (val === false) return "false";
    return "";
  }

  // Hydrate fields when selectedReview changes
  useEffect(() => {
    setEditStatus(safeText(selectedReview?.env_status));
    setEditReviewer(safeText(selectedReview?.env_reviewer));
    setEditComments(safeText(selectedReview?.comments));

    setStartDate(toInputDate(selectedReview?.env_review_start_date));
    setCompleteDate(toInputDate(selectedReview?.env_review_complete_date));

    setModifyLdar(boolToString(selectedReview?.modify_ldar));
    setModifyControl(boolToString(selectedReview?.modify_control_device));
    setIncreaseProcess(boolToString(selectedReview?.increase_process));
    setOutsideSource(boolToString(selectedReview?.require_outside_emission_source));
    setPermitting(boolToString(selectedReview?.permitting));
  }, [selectedReview]);

  // Handle Save
  async function handleSaveReview() {
    if (!selectedReview?.id) return;

    setSaveError(null);

    try {
      setSavingReview(true);

      const updates = {
        env_status: editStatus || null,
        env_reviewer: editReviewer || null,
        comments: editComments || null,
        
        env_review_start_date: startDate || null,
        env_review_complete_date: completeDate || null,

        modify_ldar: stringToBool(modifyLdar),
        modify_control_device: stringToBool(modifyControl),
        increase_process: stringToBool(increaseProcess),
        require_outside_emission_source: stringToBool(outsideSource),
        permitting: stringToBool(permitting),
      };

      const { data, error } = await supabase
        .from("env_reviews")
        .update(updates)
        .eq("id", selectedReview.id)
        .select("*")
        .single();

      if (error) throw error;

      if (onReviewUpdated) {
        onReviewUpdated(data);
      }
    } catch (e) {
      setSaveError(e?.message ?? "Failed to save review");
    } finally {
      setSavingReview(false);
    }
  }

  // --- Sub-component for Questions with Alerts ---
  function QuestionRow({ label, value, onChange, alertMessage }) {
    const isYes = value === "true";
    return (
      <div style={{ borderBottom: "1px solid #333", paddingBottom: 12 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 120px", gap: 10, alignItems: "center" }}>
          <div style={{ fontSize: 13 }}>{label}</div>
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={{
              padding: 8,
              borderRadius: 6,
              border: "1px solid #444",
              background: "#0f0f0f",
              color: "#fff",
            }}
          >
            <option value="">(Select...)</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
        
        {/* Conditional Alert */}
        {isYes && alertMessage && (
          <div style={{ 
            marginTop: 8, 
            padding: "8px 12px", 
            borderRadius: 6, 
            background: "#422006", // Dark orange background
            border: "1px solid #a16207", // Orange border
            color: "#fdba74", // Light orange text
            fontSize: 12,
            display: "flex",
            alignItems: "center",
            gap: 8
          }}>
            <span>⚠️</span> 
            <strong>Action Required:</strong> {alertMessage}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ border: "1px solid #333", borderRadius: 8, padding: 12 }}>
      <h2 style={{ marginTop: 0, fontSize: 18 }}>
        Air Department Review{" "}
        <span style={{ opacity: 0.7, fontWeight: 400 }}>
          — {selectedMoc ? getMocLabel(selectedMoc) : "(select a MOC)"}
        </span>
      </h2>

      {/* Start/Continue Button */}
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
        <button
          onClick={startOrContinueReview}
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
          {creatingReview
            ? "Working…"
            : selectedReview
            ? "Continue review"
            : "Start review"}
        </button>

        {loadingReviews && <span>Loading review…</span>}
        {createError && <span style={{ color: "salmon" }}><b>Error:</b> {createError}</span>}
        {errorReviews && <span style={{ color: "salmon" }}><b>Error:</b> {errorReviews}</span>}
      </div>

      {!selectedReview ? (
        <div style={{ opacity: 0.8 }}>No review selected. Click <b>Start review</b> to create one.</div>
      ) : (
        <div style={{ display: "grid", gap: 20, maxWidth: 600 }}>
          
          {/* Header Info */}
          <div style={{ display: "flex", gap: 15, fontSize: 12, opacity: 0.7, background: "#222", padding: 10, borderRadius: 6 }}>
            <div><b>Created:</b> {safeText(selectedReview.created_at).split("T")[0]}</div>
            <div><b>ID:</b> {selectedReview.id.slice(0, 8)}...</div>
          </div>

          {/* Status & Reviewer */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontWeight: 700 }}>Status</span>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                style={{ padding: 10, borderRadius: 8, border: "1px solid #444", background: "#0f0f0f", color: "#fff" }}
              >
                <option value="">(blank)</option>
                <option value="Not Reviewed">Not Reviewed</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontWeight: 700 }}>Reviewer</span>
              <input
                value={editReviewer}
                onChange={(e) => setEditReviewer(e.target.value)}
                placeholder="Name"
                style={{ padding: 10, borderRadius: 8, border: "1px solid #444", background: "#0f0f0f", color: "#fff" }}
              />
            </label>
          </div>

          {/* Date Pickers */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontWeight: 700 }}>Start Date</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{ padding: 10, borderRadius: 8, border: "1px solid #444", background: "#0f0f0f", color: "#fff", fontFamily: "inherit" }}
              />
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontWeight: 700 }}>Complete Date</span>
              <input
                type="date"
                value={completeDate}
                onChange={(e) => setCompleteDate(e.target.value)}
                style={{ padding: 10, borderRadius: 8, border: "1px solid #444", background: "#0f0f0f", color: "#fff", fontFamily: "inherit" }}
              />
            </label>
          </div>

          {/* Questions */}
          <div>
            <h3 style={{ fontSize: 16, borderBottom: "1px solid #444", paddingBottom: 6, marginBottom: 12 }}>
              Environmental Impact Questions
            </h3>
            <div style={{ display: "grid", gap: 12 }}>
              
              <QuestionRow 
                label="1. Does this project modify equipment or piping in the LDAR program?" 
                value={modifyLdar} 
                onChange={setModifyLdar}
                alertMessage="Send Summary Email of MOC to LDAR Team"
              />
              
              <QuestionRow 
                label="2. Does this project modify equipment or piping relating to a control device?" 
                value={modifyControl} 
                onChange={setModifyControl} 
                alertMessage="Send Summary Email of MOC to LDAR Team"
              />
              
              <QuestionRow 
                label="3. Does this project increase product output from the process?" 
                value={increaseProcess} 
                onChange={setIncreaseProcess} 
                alertMessage="Requires updated Emission Calculations"
              />
              
              <QuestionRow 
                label="4. Does this project require an outside emission source to be brought onsite?" 
                value={outsideSource} 
                onChange={setOutsideSource} 
                alertMessage="Requires updated Emission Calculations"
              />
              
              <QuestionRow 
                label="5. Does this project require an update or new permitting?" 
                value={permitting} 
                onChange={setPermitting} 
                alertMessage="Requires updated Permiting process. Send Summary email to Air Team"
              />

            </div>
          </div>

          {/* Comments */}
          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontWeight: 700 }}>General Comments</span>
            <textarea
              value={editComments}
              onChange={(e) => setEditComments(e.target.value)}
              placeholder="Add notes..."
              rows={3}
              style={{ padding: 10, borderRadius: 8, border: "1px solid #444", background: "#0f0f0f", color: "#fff", fontFamily: "inherit" }}
            />
          </label>

          {/* Save Button */}
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 10 }}>
            <button
              onClick={handleSaveReview}
              disabled={savingReview}
              style={{ padding: "10px 20px", borderRadius: 8, border: "1px solid #444", background: "#222", color: "#fff", cursor: "pointer", fontWeight: "bold" }}
            >
              {savingReview ? "Saving…" : "Save Changes"}
            </button>
            {saveError && <span style={{ color: "salmon" }}><b>Error:</b> {saveError}</span>}
          </div>

          {/* PDF Download Button */}
            {selectedReview && selectedMoc && (
            <div style={{ marginTop: 20 }}>
                <PDFDownloadLink
                document={<ReviewPdfDocument moc={selectedMoc} review={selectedReview} />}
                fileName={`Review_${selectedMoc["MOC ID"] || "Draft"}.pdf`}
                style={{
                    textDecoration: "none",
                    padding: "10px 15px",
                    color: "#fff",
                    backgroundColor: "#2563eb", // Blue color
                    borderRadius: "6px",
                    fontSize: "13px",
                    fontWeight: "bold"
                }}
                >
                {({ blob, url, loading, error }) =>
                    loading ? 'Generating PDF...' : 'Download PDF Report'
                }
    </PDFDownloadLink>
  </div>
)}

        </div>
      )}
    </div>
  );
}