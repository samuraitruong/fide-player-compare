import React from "react";
import { useFideCompare } from "@/hooks/useFideCompare";
import { GameResultStats } from "./GameResultStats";

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

    // We'll use the GameResultStats component instead of creating pie data objects

    const hasGames = whiteTotal + blackTotal > 0;

    return (
        <div className="p-2 w-full md:w-1/2 md:basic-1/2 lg:w-1/3 lg:basis-1/3 lg:max-w-[33%] flex-shrink-0">
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
                        <GameResultStats 
                            title="As White" 
                            win={whiteWin} 
                            draw={whiteDraw} 
                            lose={whiteLose} 
                            total={whiteTotal} 
                        />
                        <GameResultStats 
                            title="As Black" 
                            win={blackWin} 
                            draw={blackDraw} 
                            lose={blackLose} 
                            total={blackTotal} 
                        />
                    </div>
                )}
                {!loading && !error && !hasGames && (
                    <div className="text-gray-400">No comparison data available.</div>
                )}
            </div>
        </div>
    );
}
