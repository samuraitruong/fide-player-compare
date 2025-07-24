import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import annotationPlugin from "chartjs-plugin-annotation";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, annotationPlugin);

export type ChartType = "rating" | "rapid_rtng" | "blitz_rtng";

interface PlayerChartProps {
  players: Array<{
    name: string;
    data: any[];
  }>;
  chartType: ChartType;
}

export function PlayerChart({ players, chartType }: PlayerChartProps) {
  // Collect all dates for x-axis
  const allDates = Array.from(
    new Set(
      players.flatMap((p) => p.data.map((d) => d.date_2))
    )
  ).sort();

  const datasets = players.map((p) => ({
    label: p.name,
    data: allDates.map((date) => {
      const found = p.data.find((d) => d.date_2 === date);
      return found ? found[chartType] ?? null : null;
    }),
    fill: false,
    borderColor: `hsl(${Math.random() * 360},70%,50%)`,
    tension: 0.1,
  }));

  // Calculate dynamic height for chart (desktop)
  // Use 50vh or min 320px, max 600px
  const chartHeight = Math.max(320, Math.min(window.innerHeight * 0.7, 600));

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: "Player Rating Progress" },
      annotation: {
        annotations: {
          cmLine: {
            type: 'line' as const,
            yMin: 2000,
            yMax: 2000,
            borderColor: 'rgba(255, 99, 132, 0.7)',
            borderWidth: 2,
            label: {
              enabled: true,
              content: 'CM Level (2000)',
              position: 'end' as const,
              color: 'rgba(255, 99, 132, 1)',
              backgroundColor: 'rgba(255,255,255,0.8)',
              font: { weight: 'bold' as const },
            },
          },
        },
      },
    },
  };

  const data = {
    labels: allDates,
    datasets,
  };

  return (
    <div style={{ position: "relative", width: "100%", height: chartHeight }}>
      <Line options={options} data={data} />
    </div>
  );
}
