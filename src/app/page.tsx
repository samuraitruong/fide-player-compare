"use client";

import React, { useState, useEffect } from "react";
import { fetchPlayerRatings } from "../hooks/usePlayerRatings";
import { PlayerChart } from "@/components/PlayerChart";
import { FideCompareBlock } from "@/components/FideCompareBlock";
import { FidePlayerSearch } from "@/components/FidePlayerSearch";
import { CopyLinkButton } from "@/components/Share";
import { Bar } from "react-chartjs-2";
import { Chart, BarElement, ArcElement, Tooltip, Legend } from "chart.js";

Chart.register(BarElement, ArcElement, Tooltip, Legend);

type Player = {
  id: string;
  name: string;
};

type RatingType = "rating" | "rapid_rtng" | "blitz_rtng";

// Player rating data type
export type PlayerRatingRow = {
  date_2: string;
  id_number: string;
  rating: number | null;
  period_games: number | null;
  rapid_rtng: number | null;
  rapid_games: number | null;
  blitz_rtng: number | null;
  blitz_games: number | null;
  name: string;
  country: string;
};

export type PlayerRatingData = PlayerRatingRow[];

function PlayerChartWrapper({ ratingsData, chartType }: { ratingsData: { name: string; data: PlayerRatingData }[]; chartType: RatingType }) {
  return <PlayerChart players={ratingsData} chartType={chartType} />;
}

export default function Home() {
  const [compareList, setCompareList] = useState<Player[]>([]);
  const [chartType, setChartType] = useState<RatingType>("rating");
  const [ratingsData, setRatingsData] = useState<{ name: string; data: PlayerRatingData }[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Read player IDs from URL and fetch player data on mount
  useEffect(() => {
    const loadPlayersFromUrl = async () => {
      // Get player IDs from URL query parameters
      const params = new URLSearchParams(window.location.search);
      const playerIds = params.get('id')?.split(',').filter(Boolean) || [];

      if (playerIds.length > 0) {
        setLoading(true);
        // Fetch player data for each ID
        const players = await Promise.all(
          playerIds.map(async (id) => {
            // Fetch one rating to get the player name
            const data = await fetchPlayerRatings(id);
            const name = data.length > 0 ? data[0].name : id;
            return { id, name };
          })
        );
        setCompareList(players);
      } else {
        // Set default player if no IDs in URL
        setCompareList([{ id: "3267849", name: "Nguyen Anh Kiet" }]);
      }
      setInitialLoadComplete(true);
    };

    loadPlayersFromUrl();
  }, []);

  // Update URL when compareList changes
  useEffect(() => {
    if (!initialLoadComplete) return;

    // Create URL with player IDs
    const playerIds = compareList.map(player => player.id).join(',');
    const url = playerIds ? `?id=${playerIds}` : window.location.pathname;

    // Update browser URL without reloading the page
    window.history.replaceState({}, '', url);
  }, [compareList, initialLoadComplete]);

  useEffect(() => {
    let isMounted = true;
    async function fetchRatings() {
      setLoading(true);
      if (compareList.length === 0) {
        setRatingsData([]);
        setLoading(false);
        return;
      }
      const results = await Promise.all(
        compareList.map(async (player) => {
          const data = await fetchPlayerRatings(player.id);
          return { name: player.name, data };
        })
      );
      if (isMounted) setRatingsData(results);
      setLoading(false);
    }
    fetchRatings();
    return () => { isMounted = false; };
  }, [compareList]);

  type FideSearchPlayer = { fideId: string; name: string };
  const handleSelectPlayer = (player: FideSearchPlayer | null) => {
    if (player && !compareList.some((p) => p.id === player.fideId)) {
      setCompareList([...compareList, { id: player.fideId, name: player.name }]);
    }
  };

  // Color palette for rating & bar chart
  const colorPalette = [
    "#6366f1", // indigo-500
    "#4f46e5", // indigo-600
    "#818cf8", // indigo-400
    "#a5b4fc", // indigo-300
    "#c7d2fe", // indigo-200
    "#fbbf24", // amber-400
    "#ef4444", // red-500
    "#22d3ee", // cyan-400
    "#10b981", // emerald-500
    "#f59e42"  // orange-400
  ];

  // Helper to get period_games for each month for all players
  function getMonthlyGamesData(ratingsData: { name: string; data: PlayerRatingData }[], ratingType: RatingType) {
    // Collect all months present in any player's data
    const allMonths = Array.from(new Set(ratingsData.flatMap(p => p.data.map((row: PlayerRatingRow) => row.date_2)))).sort();
    // For each player, build a map of month -> games
    const playerMonthGames = ratingsData.map(p => {
      const monthMap: Record<string, number> = {};
      p.data.forEach((row: PlayerRatingRow) => {
        if (ratingType === "rating") monthMap[row.date_2] = row.period_games || 0;
        if (ratingType === "rapid_rtng") monthMap[row.date_2] = row.rapid_games || 0;
        if (ratingType === "blitz_rtng") monthMap[row.date_2] = row.blitz_games || 0;
      });
      return monthMap;
    });
    // Build datasets for each player
    const datasets = ratingsData.map((p, i) => ({
      label: p.name,
      data: allMonths.map(month => playerMonthGames[i][month] || 0),
      backgroundColor: colorPalette[i % colorPalette.length],
      borderRadius: 6,
    }));
    return { labels: allMonths, datasets };
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-100 to-slate-50 text-gray-900 font-sans">
      <main className="w-full py-3 px-0 md:px-2">
        <h1 className="text-3xl font-bold mb-3 text-center tracking-tight">FIDE Rating Progess</h1>
        <section className="mb-4 bg-white rounded-xl shadow-md p-4">
          <div className="flex flex-row items-center gap-4 flex-wrap">
            <div className="flex flex-col gap-1 flex-1 min-w-[220px]">
              <FidePlayerSearch
                onSelect={handleSelectPlayer}
                inputClassName="w-full px-3 py-2 border border-slate-300 rounded-md bg-slate-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                dropdownClassName="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-md shadow-lg text-gray-900"
                itemClassName="px-3 py-2 cursor-pointer hover:bg-indigo-100"
              />
            </div>
            <fieldset className="flex flex-row gap-2 items-center flex-wrap">
              {[
                { value: "rating", label: "Standard" },
                { value: "rapid_rtng", label: "Rapid" },
                { value: "blitz_rtng", label: "Blitz" },
              ].map(opt => (
                <label key={opt.value} className="flex items-center gap-1 px-2 py-1 rounded-md cursor-pointer bg-slate-100 hover:bg-indigo-100">
                  <input
                    type="radio"
                    name="chartType"
                    value={opt.value}
                    checked={chartType === opt.value}
                    onChange={() => setChartType(opt.value as RatingType)}
                    className="accent-indigo-500"
                  />
                  <span className="text-sm">{opt.label}</span>
                </label>
              ))}
            </fieldset>
          </div>
        </section>
        <section className="bg-white rounded-xl shadow-md p-1 md:p-2">
          <div className="flex flex-wrap justify-between items-center gap-2 mb-2">
            <div className="flex flex-wrap gap-2">
              {compareList.map((p) => (
                <span key={p.id} className="flex items-center bg-indigo-100 text-indigo-800 rounded-full px-3 py-1 text-sm font-medium shadow-sm">
                  {p.name} <span className="ml-1 text-gray-500">({p.id})</span>
                  <button
                    className="ml-2 text-indigo-500 hover:text-red-500 focus:outline-none"
                    aria-label={`Remove ${p.name}`}
                    onClick={() => setCompareList(compareList.filter(player => player.id !== p.id))}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </span>
              ))}
            </div>
            {compareList.length > 0 && (
              <CopyLinkButton />
            )}
          </div>
          <div className="min-h-[400px] bg-slate-50 border border-slate-200 rounded-lg p-1 md:p-2 w-full">
            {loading ? (
              <div className="flex flex-col items-center justify-center w-full h-full">
                <svg className="animate-spin h-8 w-8 text-indigo-500 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                <span className="text-indigo-500 text-lg">Loading player ratings...</span>
              </div>
            ) : compareList.length > 0 ? (
              <>
                <div className="w-full">
                  <PlayerChartWrapper ratingsData={ratingsData} chartType={chartType} />
                </div>
                {/* Bar chart for period_games comparison by month */}
                <div className="w-full mx-auto mt-6">
                  <Bar
                    data={getMonthlyGamesData(ratingsData, chartType)}
                    options={{
                      plugins: { legend: { display: true, position: 'bottom' } },
                      scales: {
                        x: { grid: { display: false }, title: { display: true, text: 'Month' }, ticks: { font: { size: 14 } } },
                        y: { beginAtZero: true, grid: { display: false }, title: { display: true, text: 'Games Played' }, ticks: { font: { size: 14 } } }
                      },
                      responsive: true,
                      maintainAspectRatio: false,
                    }}
                    height={400}
                  />
                </div>
                <div className="w-full mt-6 flex flex-row flex-wrap">
                  {compareList.length > 1 && compareList.map((p1, i) => (
                    compareList.slice(i + 1).map((p2) => (
                      <FideCompareBlock
                        ratingType={chartType}
                        key={p1.id + '-' + p2.id}
                        id1={p1.id}
                        id2={p2.id}
                        name1={p1.name}
                        name2={p2.name}
                      />

                    ))
                  ))}
                </div>
              </>
            ) : (
              <span className="text-gray-400">Add players to compare their progress.</span>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
