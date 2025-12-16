// --- Helpers (handles funky column names like "MOC ID") ---
export function getMocLabel(moc) {
  if (!moc) return "";

  const candidates = [
    moc.moc_id,
    moc.mocid,
    moc.moc_code,
    moc.moc_number,
    moc["moc_id"],
    moc["MOC_ID"],
    moc["MOC ID"],
  ];

  const found = candidates.find((v) => typeof v === "string" && v.trim().length > 0);
  if (found) return found;

  return moc.id ? String(moc.id).slice(0, 8) : "(unknown MOC)";
}
