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
        const data = await fetchMocs();
        if (ignore) return;

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
