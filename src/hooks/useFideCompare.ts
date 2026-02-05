
import { useEffect, useState } from "react";
import { fetchWithRetry } from "@/util";

export type FideCompareParsedStats = {
  total: number;
  win: number;
  draw: number;
  lose: number;
};

export function useFideCompare(id1: string, id2: string, ratingType: "rating" | "rapid_rtng" | "blitz_rtng") {
  const [raw, setRaw] = useState<Record<string, unknown> | null>(null);
  const [parsed, setParsed] = useState<FideCompareParsedStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id1 || !id2) return;
    let isMounted = true;
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    setRaw(null);
    setParsed(null);
    const url = `https://ratings.fide.com/a_data_stats.php?id1=${id1}&id2=${id2}`;
    const proxyUrl = `https://no-cors.fly.dev/cors/${url}`;
    fetchWithRetry(proxyUrl, {
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
      signal: controller.signal,
    }, {
      retries: 4,
      timeoutMs: 15_000,
      signal: controller.signal,
    })
      .then(res => res.ok ? res.json() : Promise.reject('Failed to fetch'))
      .then(json => {
        if (!isMounted) return;
        const data = json && Array.isArray(json) ? json[0] as Record<string, unknown> : null;
        setRaw(data);
        // Parse stats for selected rating type
        if (data) {
          const suffix = ratingType === "rating" ? "_std" : ratingType === "rapid_rtng" ? "_rpd" : "_blz";
          const safeNum = (val: unknown) => val == null || isNaN(Number(val)) ? 0 : Number(val);
          const total = safeNum(data[`white_total${suffix}`]) + safeNum(data[`black_total${suffix}`]);
          const win = safeNum(data[`white_win_num${suffix}`]) + safeNum(data[`black_win_num${suffix}`]);
          const draw = safeNum(data[`white_draw_num${suffix}`]) + safeNum(data[`black_draw_num${suffix}`]);
          const lose = total - win - draw;
          setParsed({ total, win, draw, lose });
        } else {
          setParsed(null);
        }
      })
      .catch(() => {
        if (isMounted) setError('Failed to fetch comparison data');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [id1, id2, ratingType]);

  return { raw, parsed, loading, error };
}
