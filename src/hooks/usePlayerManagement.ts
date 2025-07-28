import { randomColor } from "@/util";
import { Player, FideSearchPlayer } from "@/types/player";

export function usePlayerManagement(compareList: Player[], setCompareList: (players: Player[]) => void) {
    const handleSelectPlayer = (player: FideSearchPlayer | null) => {
        if (player && !compareList.some((p) => p.id === player.fideId)) {
            // Assign a consistent color for this new player
            const color = randomColor();
            setCompareList([...compareList, { id: player.fideId, name: player.name, color }]);
        }
    };

    const removePlayer = (playerId: string) => {
        setCompareList(compareList.filter(player => player.id !== playerId));
    };

    return {
        handleSelectPlayer,
        removePlayer
    };
}