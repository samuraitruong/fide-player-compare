import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
Chart.register(ArcElement, Tooltip, Legend);

import { useFideCompare } from "@/hooks/useFideCompare";

// Helper to safely get numbers for FideCompareBlock
function safeNum(val: unknown): number {
  if (val == null) return 0;
  if (typeof val === "number") return val;
  const num = Number(val);
  return isNaN(num) ? 0 : num;
}

export function FideCompareBlock({ id1, id2, name1, name2, ratingType }: { id1: string; id2: string; name1: string; name2: string; ratingType: "rating" | "rapid_rtng" | "blitz_rtng" }) {
    const { raw, loading, error } = useFideCompare(id1, id2, ratingType);

    // Map ratingType to suffix
    const suffix = ratingType === "rating" ? "_std" : ratingType === "rapid_rtng" ? "_rpd" : "_blz";
    const typeLabel = ratingType === "rating" ? "Standard" : ratingType === "rapid_rtng" ? "Rapid" : "Blitz";

    // Parse stats for white
    const whiteTotal = raw ? safeNum(raw[`white_total${suffix}`]) : 0;
    const whiteWin = raw ? safeNum(raw[`white_win_num${suffix}`]) : 0;
    const whiteDraw = raw ? safeNum(raw[`white_draw_num${suffix}`]) : 0;
    const whiteLose = whiteTotal - whiteWin - whiteDraw;

    // Parse stats for black
    const blackTotal = raw ? safeNum(raw[`black_total${suffix}`]) : 0;
    const blackWin = raw ? safeNum(raw[`black_win_num${suffix}`]) : 0;
    const blackDraw = raw ? safeNum(raw[`black_draw_num${suffix}`]) : 0;
    const blackLose = blackTotal - blackWin - blackDraw;

    const pieDataWhite = whiteTotal > 0 ? {
        labels: ["Win", "Draw", "Lose"],
        datasets: [
            {
                data: [whiteWin, whiteDraw, whiteLose],
                backgroundColor: ["#4f46e5", "#fbbf24", "#ef4444"],
                borderWidth: 1,
            },
        ],
    } : null;
    console.log("pieDataWhite", pieDataWhite);
    const pieDataBlack = blackTotal > 0 ? {
        labels: ["Win", "Draw", "Lose"],
        datasets: [
            {
                data: [blackWin, blackDraw, blackLose],
                backgroundColor: ["#6366f1", "#fde68a", "#f87171"],
                borderWidth: 1,
            },
        ],
    } : null;

    const hasGames = whiteTotal + blackTotal > 0;

    return (
        <div className="p-2 basis-1/3 max-w-[33%] flex-shrink-0">
            <div className="bg-white rounded-xl shadow p-3 flex flex-col items-center  min-w-0">
                <div className="font-semibold text-lg mb-1">{name1} vs {name2}</div>
                <div className="text-sm text-gray-500 mb-2">{typeLabel} games: {whiteTotal + blackTotal}</div>
                {loading && (
                    <div className="flex items-center justify-center py-4">
                        <svg className="animate-spin h-6 w-6 text-indigo-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                        </svg>
                        <span className="text-indigo-500 text-lg">Loading comparison...</span>
                    </div>
                )}
                {error && <div className="text-red-500">{error}</div>}
                {hasGames && (
                    <div className="flex flex-row gap-8 justify-center w-full">
                        {pieDataWhite && (
                            <div className="flex flex-col items-center">
                                <div className="text-sm font-medium text-gray-700 mb-1">As White</div>
                                <div className="w-[120px] h-[120px] mx-auto">
                                    <Pie data={pieDataWhite} options={{ plugins: { legend: { display: true, position: 'bottom' as const } } }} />
                                </div>
                            </div>
                        )}
                        {pieDataBlack && (
                            <div className="flex flex-col items-center">
                                <div className="text-sm font-medium text-gray-700 mb-1">As Black</div>
                                <div className="w-[120px] h-[120px] mx-auto">
                                    <Pie data={pieDataBlack} options={{ plugins: { legend: { display: true, position: 'bottom' as const } } }} />
                                </div>
                            </div>
                        )}
                    </div>
                )}
                {!loading && !error && !hasGames && (
                    <div className="text-gray-400">No comparison data available.</div>
                )}
            </div>
        </div>
    );
}
