import { useEffect, useState } from "react";
import { fetchFileHistory } from "@/integrations/supabase/api/file-history";

export function useFileHistory(actionFilter?: 'upload' | 'download') {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchFileHistory({ action: actionFilter })
      .then(setHistory)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [actionFilter]);

  return { history, loading, error };
}
