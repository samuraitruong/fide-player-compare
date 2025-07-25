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

export function randomColor(i: number): string {
    return colorPalette[i % colorPalette.length];
}