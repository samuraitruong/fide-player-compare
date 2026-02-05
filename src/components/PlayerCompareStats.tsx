import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { fetchWithRetry } from "@/util";

ChartJS.register(ArcElement, Tooltip, Legend);

// Fetch comparison stats between two players
async function fetchCompareStats(id1: string, id2: string) {
  const url = `https://ratings.fide.com/a_data_stats.php?id1=${id1}&id2=${id2}`;
  const proxyUrl = `https://no-cors.fly.dev/cors/${url}`;
  try {
    const res = await fetchWithRetry(proxyUrl, {
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
    }, {
      retries: 4,
      timeoutMs: 15_000,
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json && Array.isArray(json) ? json[0] : null;
  } catch {
    return null;
  }
}

export type CompareStat = {
  p1: { id: string; name: string };
  p2: { id: string; name: string };
  stat: Record<string, string | number | null> | null;
};

export function PlayerCompareStats({ compareList }: { compareList: { id: string; name: string }[] }) {
  const [stats, setStats] = useState<CompareStat[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchAllStats() {
      setLoading(true);
      const pairs = [];
      for (let i = 0; i < compareList.length; i++) {
        for (let j = i + 1; j < compareList.length; j++) {
          pairs.push([compareList[i], compareList[j]]);
        }
      }
      const results: CompareStat[] = await Promise.all(
        pairs.map(async ([p1, p2]) => {
          const stat = await fetchCompareStats(p1.id, p2.id);
          return { p1, p2, stat };
        })
      );
      if (isMounted) setStats(results);
      setLoading(false);
    }
    if (compareList.length > 1) {
      fetchAllStats();
    } else {
      setStats([]);
    }
    return () => { isMounted = false; };
  }, [compareList]);

  if (compareList.length < 2) return null;

  return (
    <div className="w-full mt-6 flex flex-col gap-6">
      {loading && (
        <div className="flex items-center justify-center py-6">
          <svg className="animate-spin h-6 w-6 text-indigo-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          <span className="text-indigo-500 text-lg">Loading comparison stats...</span>
        </div>
      )}
      {!loading && stats.map(({ p1, p2, stat }, idx) => {
        if (!stat) return (
          <div key={idx} className="bg-red-50 text-red-700 rounded-lg p-4 shadow">
            No comparison data for {p1.name} vs {p2.name}
          </div>
        );
        // Example: show pie chart for standard games
        const totalGames = Number(stat.white_total_std) + Number(stat.black_total_std);
        const win = Number(stat.white_win_num_std) + Number(stat.black_win_num_std);
        const draw = Number(stat.white_draw_num_std) + Number(stat.black_draw_num_std);
        const lose = totalGames - win - draw;
        const pieData = {
          labels: ["Win", "Draw", "Lose"],
          datasets: [
            {
              data: [win, draw, lose],
              backgroundColor: ["#4f46e5", "#fbbf24", "#ef4444"],
              borderWidth: 1,
            },
          ],
        };
        return (
          <div key={idx} className="flex flex-col items-center gap-2 bg-slate-50 rounded-xl shadow p-4 w-full">
            <div className="font-semibold text-lg mb-1 text-center">{p1.name} vs {p2.name}</div>
            <div className="text-sm text-gray-500 mb-2 text-center">Standard games: {totalGames}</div>
            <div className="w-[120px] h-[120px] mx-auto">
              <Pie data={pieData} options={{ plugins: { legend: { display: true, position: 'bottom' as const } } }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
