import { useEffect, useState } from "react";
import { fetchMocs } from "../api/mocs";

export function useMocs() {
  const [mocs, setMocs] = useState([]);
  const [selectedMoc, setSelectedMoc] = useState(null);
  const [loadingMocs, setLoadingMocs] = useState(true);
  const [errorMocs, setErrorMocs] = useState(null);

  useEffect(() => {
    let ignore = false;

    async function load() {
      setLoadingMocs(true);
      setErrorMocs(null);

      try {
        let data = await fetchMocs();
        if (ignore) return;

        // --- SORTING LOGIC START ---
        // This sorts the list by the 4-digit number at the end of the MOC ID
        if (data && data.length > 0) {
          data.sort((a, b) => {
            // Helper function to extract the number (e.g. from "ML.A1 | 2025 | 3356")
            const getNumber = (mocString) => {
              if (!mocString) return 0;
              const parts = mocString.split('|'); // Split by the pipe symbol
              const lastPart = parts[parts.length - 1]; // Grab the last chunk (" 3356")
              const number = parseInt(lastPart, 10); // Convert to real number
              return isNaN(number) ? 0 : number;
            };

            const numA = getNumber(a["MOC ID"]);
            const numB = getNumber(b["MOC ID"]);

            // Sort Descending (Highest number first)
            return numB - numA;
          });
        }
        // --- SORTING LOGIC END ---

        setMocs(data || []);
        if ((data || []).length > 0) setSelectedMoc((prev) => prev ?? data[0]);
      } catch (e) {
        if (ignore) return;
        setErrorMocs(e?.message ?? "Failed to load MOCs");
        setMocs([]);
        setSelectedMoc(null);
      } finally {
        if (!ignore) setLoadingMocs(false);
      }
    }

    load();

    return () => {
      ignore = true;
    };
  }, []);

  return {
    mocs,
    selectedMoc,
    setSelectedMoc,
    loadingMocs,
    errorMocs,
  };
}
