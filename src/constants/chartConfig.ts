/* eslint-disable @typescript-eslint/no-explicit-any */
export const getChartOptions = (labelsCount: number) => ({
    plugins: {
        legend: {
            display: true,
            position: 'bottom' as const
        },
        tooltip: {
            filter: function (tooltipItem: any) {
                // Hide tooltip for zero values
                return tooltipItem.parsed.y !== 0;
            }
        }
    },
    scales: {
        x: {
            grid: { display: false },
            title: { display: true, text: 'Month' },
            ticks: {
                font: { size: 14 },
                // Hide labels if there are too many (more than 12 months)
                display: labelsCount <= 12,
                maxTicksLimit: labelsCount > 12 ? 6 : undefined,
                callback: function (value: any, index: number, ticks: any) {
                    // For many labels, show only every nth label
                    if (labelsCount > 12 && index % Math.ceil(labelsCount / 6) !== 0) {
                        return '';
                    }
                    return ticks[index]?.label || value;
                }
            }
        },
        y: {
            beginAtZero: true,
            grid: { display: false },
            title: { display: true, text: 'Games Played' },
            ticks: {
                font: { size: 14 },
                callback: function (value: any) {
                    // Hide zero labels on y-axis
                    return value === 0 ? '' : value;
                }
            }
        }
    },
    responsive: true,
    maintainAspectRatio: false,
});

export const CHART_HEIGHT = 400;

export const RATING_TYPE_OPTIONS = [
    { value: "rating" as const, label: "Standard" },
    { value: "rapid_rtng" as const, label: "Rapid" },
    { value: "blitz_rtng" as const, label: "Blitz" },
];