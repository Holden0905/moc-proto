import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { safeText } from "../utils/text";

export default function MocSummary({ moc }) {
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  // Sync local state when the prop changes
  useEffect(() => {
    if (moc) {
      setDescription(safeText(moc["Change Description"]));
    }
  }, [moc]);

  if (!moc) return null;

  // Helper to format the date nicely
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return dateStr.split("T")[0]; 
  };

  // --- SAVE HANDLER ---
  async function handleSave() {
    setSaving(true);
    try {
      // 1. Update Supabase
      const { error } = await supabase
        .from("mocs")
        .update({ "Change Description": description })
        .eq("id", moc.id);

      if (error) throw error;

      // 2. Turn off edit mode
      setIsEditing(false);
      
      // Optional: You might want to trigger a refresh in the parent, 
      // but strictly speaking, the local state 'description' is already correct.
    } catch (err) {
      alert("Error saving description: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ 
      border: "1px solid #333", 
      borderRadius: 8, 
      padding: 12,
      background: "#111",
      color: "#eee",
      height: "100%",        
      boxSizing: "border-box", 
      display: "flex",       
      flexDirection: "column" 
    }}>
      
      {/* 1. Header: Title and MOC ID */}
      <div style={{ borderBottom: "1px solid #333", paddingBottom: 10, marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: "bold", color: "#888", textTransform: "uppercase" }}>
          {safeText(moc["MOC ID"] || "No ID")}
        </div>
        <h2 style={{ margin: "4px 0 0 0", fontSize: 18, lineHeight: 1.3 }}>
          {safeText(moc["Change Title"] || "Untitled MOC")}
        </h2>
      </div>

      {/* 2. Meta Data Grid */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "1fr 1fr", 
        gap: 12, 
        background: "#1a1a1a", 
        padding: 10, 
        borderRadius: 6,
        marginBottom: 12 
      }}>
        {/* Row 1 */}
        <div>
          <label style={{ fontSize: 10, fontWeight: "bold", color: "#666", textTransform: "uppercase", display: "block" }}>Owner</label>
          <span style={{ fontSize: 13 }}>{safeText(moc["Change Owner"])}</span>
        </div>
        <div>
          <label style={{ fontSize: 10, fontWeight: "bold", color: "#666", textTransform: "uppercase", display: "block" }}>Effective Date</label>
          <span style={{ fontSize: 13 }}>{formatDate(moc["Effective Date of Change"])}</span>
        </div>
        {/* Row 2 */}
        <div>
          <label style={{ fontSize: 10, fontWeight: "bold", color: "#666", textTransform: "uppercase", display: "block" }}>Status</label>
          <span style={{ fontSize: 13, fontWeight: "bold", color: safeText(moc["Status"]) === "Draft" ? "#fbbf24" : "#fff" }}>
            {safeText(moc["Status"]) || "N/A"}
          </span>
        </div>
        <div>
          <label style={{ fontSize: 10, fontWeight: "bold", color: "#666", textTransform: "uppercase", display: "block" }}>Sub-Type</label>
          <span style={{ fontSize: 13 }}>{safeText(moc["Sub-Type"])}</span>
        </div>
        {/* Row 3 */}
        <div>
          <label style={{ fontSize: 10, fontWeight: "bold", color: "#666", textTransform: "uppercase", display: "block" }}>Facility / Location</label>
          <span style={{ fontSize: 13 }}>{safeText(moc["Facility"])} / {safeText(moc["Location"])}</span>
        </div>
        <div>
          <label style={{ fontSize: 10, fontWeight: "bold", color: "#666", textTransform: "uppercase", display: "block" }}>Workflow</label>
          <span style={{ fontSize: 13 }}>{safeText(moc["Workflow Status"])}</span>
        </div>
      </div>

      {/* 3. Assets Section */}
      <div style={{ marginBottom: 15, padding: "0 4px" }}>
        <label style={{ fontSize: 10, fontWeight: "bold", color: "#666", textTransform: "uppercase" }}>Impacted Assets</label>
        <div style={{ fontSize: 12, color: moc["Assets"] ? "#aaa" : "#555", marginTop: 2 }}>
          {safeText(moc["Assets"]) || "None Listed"}
        </div>
      </div>

      {/* 4. Description (Editable) */}
      <div style={{ 
        flex: 1, 
        borderTop: "1px solid #333", 
        paddingTop: 12,
        minHeight: 0,
        display: "flex",
        flexDirection: "column"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <label style={{ fontSize: 11, fontWeight: "bold", color: "#666", textTransform: "uppercase" }}>
            Description
          </label>
          
          {/* Edit / Save Toggle */}
          {!isEditing ? (
            <button 
              onClick={() => setIsEditing(true)}
              style={{ background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: 12, textDecoration: "underline" }}
            >
              Edit ✏️
            </button>
          ) : (
            <div style={{ display: "flex", gap: 8 }}>
              <button 
                onClick={() => setIsEditing(false)}
                style={{ background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: 11 }}
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={saving}
                style={{ background: "#222", border: "1px solid #444", color: "#fff", cursor: "pointer", fontSize: 11, padding: "2px 8px", borderRadius: 4 }}
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          )}
        </div>

        {/* Content Area */}
        {isEditing ? (
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ 
              flex: 1, 
              width: "100%", 
              background: "#0f0f0f", 
              color: "#fff", 
              border: "1px solid #444", 
              borderRadius: 4, 
              padding: 8, 
              resize: "none",
              fontFamily: "inherit",
              fontSize: 13,
              lineHeight: 1.5
            }}
          />
        ) : (
          <div style={{ 
            fontSize: 13, 
            lineHeight: "1.5", 
            whiteSpace: "pre-wrap", 
            color: "#ddd",
            height: "100%", 
            overflowY: "auto", 
            paddingRight: 4 
          }}>
            {description || "No description provided."}
          </div>
        )}
      </div>

    </div>
  );
}