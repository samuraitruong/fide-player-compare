import { PlayerRatingData, PlayerRatingRow, RatingType, Player } from "@/types/player";

// Color palette for rating & bar chart
const colorPalette = [
  "#6366f1", // indigo-500
  "#4f46e5", // indigo-600
  "#818cf8", // indigo-400
  "#a5b4fc", // indigo-300
  "#c7d2fe", // indigo-200
  "#fbbf24", // amber-400
  "#f59e0b", // amber-500
  "#ef4444", // red-500
  "#dc2626", // red-600
  "#fca5a5", // red-300
  "#22d3ee", // cyan-400
  "#06b6d4", // cyan-500
  "#0ea5e9", // sky-500
  "#3b82f6", // blue-500
  "#2563eb", // blue-600
  "#10b981", // emerald-500
  "#059669", // emerald-600
  "#34d399", // green-400
  "#4ade80", // green-300
  "#fde68a", // yellow-300
  "#f97316", // orange-500
  "#ea580c", // orange-600
  "#e879f9", // fuchsia-400
  "#c084fc", // violet-400
  "#a78bfa"  // violet-500
];

export const resultColors = ["#07a01cff", "#9cb19fff", "#e30a06ff"]; // Win, Draw, Lose colors

export function randomColor(): string {
  return colorPalette[(Math.floor(Math.random() * 1000) % colorPalette.length)];
}

// Helper to get period_games for each month for all players
export function getMonthlyGamesData(
  ratingsData: { name: string; data: PlayerRatingData }[],
  ratingType: RatingType,
  compareList: Player[]
) {
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
  const datasets = ratingsData.map((p, i) => {
    // Find the corresponding player in compareList to get the consistent color
    const playerInfo = compareList.find(player => player.name === p.name);
    return {
      label: p.name,
      data: allMonths.map(month => playerMonthGames[i][month] || 0),
      backgroundColor: playerInfo ? playerInfo.color : randomColor(),
      borderRadius: 6,
    };
  });
  return { labels: allMonths, datasets };
}