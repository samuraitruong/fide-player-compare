import React from "react";
import { Pie } from "react-chartjs-2";
import { resultColors } from "@/util";

interface GameResultStatsProps {
  title: string;
  win: number;
  draw: number;
  lose: number;
  total: number;
}

export function GameResultStats({ title, win, draw, lose, total }: GameResultStatsProps) {
  // If there's no data, don't render the chart
  if (total <= 0) return null;
  
  // Filter out zero values and create corresponding labels and data
  const values = [];
  const labels = [];
  const colors = [];
  
  if (win > 0) {
    values.push(win);
    labels.push(`Win x${win}`);
    colors.push(resultColors[0]);
  }
  
  if (draw > 0) {
    values.push(draw);
    labels.push(`Draw x${draw}`);
    colors.push(resultColors[1]);
  }
  
  if (lose > 0) {
    values.push(lose);
    labels.push(`Lose x${lose}`);
    colors.push(resultColors[2]);
  }
  
  // Only render if we have at least one non-zero value
  if (values.length === 0) return null;
  
  const pieData = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: colors,
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="flex flex-col items-center">
      <div className="text-sm font-medium text-gray-700 mb-1">{title}</div>
      <div className="w-[130px] h-[130px] mx-auto">
        <Pie data={pieData} options={{ plugins: { legend: { display: true, position: 'bottom' as const } } }} />
      </div>
    </div>
  );
}