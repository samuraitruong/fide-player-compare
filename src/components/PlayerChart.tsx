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
  ChartDataset,
} from "chart.js";
import { Line } from "react-chartjs-2";
import annotationPlugin from "chartjs-plugin-annotation";
import DataLabelsPlugin from "chartjs-plugin-datalabels";
import type { Context } from "chartjs-plugin-datalabels";
import type { PlayerRatingRow } from "../hooks/usePlayerRatings";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, annotationPlugin, DataLabelsPlugin);

export type ChartType = "rating" | "rapid_rtng" | "blitz_rtng";

interface PlayerChartProps {
  players: Array<{
    name: string;
    data: PlayerRatingRow[];
    color?: string;
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

  // Use player's assigned color if available, otherwise generate one
  const colorPalette = players.map((player, i) => 
    player.color || `hsl(${(i * 360) / players.length},70%,50%)`);
  

  const datasets = players.map((p, i) => {
    // Find peak rating for this player
    const playerData = p.data.filter(d => d[chartType] !== null);
    const peakRating = Math.max(...playerData.map(d => d[chartType] || 0));
    const peakRatingDate = playerData.find(d => d[chartType] === peakRating)?.date_2;
    
    // Create an array of peak indicators for datalabels
    const peakIndicators = allDates.map(date => {
      const found = p.data.find((d: PlayerRatingRow) => d.date_2 === date);
      const rating = found ? found[chartType] ?? null : null;
      return date === peakRatingDate && rating === peakRating ? rating : null;
    });
    
    return {
      label: p.name,
      data: allDates.map((date) => {
        const found = p.data.find((d: PlayerRatingRow) => d.date_2 === date);
        return found ? found[chartType] ?? null : null;
      }),
      fill: false,
      borderColor: colorPalette[i % colorPalette.length],
      tension: 0.1,
      // Add point styling configuration
      pointRadius: allDates.map(date => date === peakRatingDate ? 6 : 3),
      pointHoverRadius: allDates.map(date => date === peakRatingDate ? 8 : 5),
      pointBackgroundColor: allDates.map(date => date === peakRatingDate ? colorPalette[i % colorPalette.length] : 'white'),
      pointBorderColor: colorPalette[i % colorPalette.length],
      pointBorderWidth: allDates.map(date => date === peakRatingDate ? 2 : 1),
      // Add datalabels configuration
      datalabels: {
        align: 'top' as const,
        anchor: 'center' as const,
        offset: 6,
        display: (context: Context) => peakIndicators[context.dataIndex] !== null,
        formatter: (value: number | null, context: Context) => peakIndicators[context.dataIndex],
        color: colorPalette[i % colorPalette.length],
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 4,
        padding: 4,
        font: {
          weight: 'bold' as const,
          size: 10,
        },
      },
    } as ChartDataset<'line', (number | null)[]>;
  });

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
      // Global datalabels configuration
      datalabels: {
        // By default, don't show any labels
        display: false,
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
