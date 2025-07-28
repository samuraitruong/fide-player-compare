import { PlayerChart } from "@/components/PlayerChart";
import { PlayerRatingData, RatingType } from "@/types/player";

interface PlayerChartWrapperProps {
    ratingsData: { name: string; data: PlayerRatingData }[];
    chartType: RatingType;
}

export function PlayerChartWrapper({ ratingsData, chartType }: PlayerChartWrapperProps) {
    return <PlayerChart players={ratingsData} chartType={chartType} />;
}