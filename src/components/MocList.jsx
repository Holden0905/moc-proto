import { getMocLabel } from "../utils/moc";
import { safeText } from "../utils/text";

export default function MOCList({ mocs, loading, error, selectedMoc, onSelectMoc }) {
  return (
    <div style={{ border: "1px solid #333", borderRadius: 8, padding: 12 }}>
      <h2 style={{ marginTop: 0, fontSize: 18 }}>MOC List</h2>

      {loading && <div>Loading MOCs…</div>}
      {error && (
        <div style={{ color: "salmon" }}>
          <b>Error:</b> {error}
        </div>
      )}

      {!loading && !error && (
        <div style={{ maxHeight: "70vh", overflow: "auto" }}>
          {mocs.map((moc) => {
            const active = selectedMoc?.id === moc.id;
            return (
              <button
                key={moc.id}
                onClick={() => onSelectMoc(moc)}
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
  );
}