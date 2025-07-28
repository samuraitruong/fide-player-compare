import { useState, useEffect } from "react";
import { fetchPlayerRatings } from "./usePlayerRatings";
import { randomColor } from "@/util";
import { Player } from "@/types/player";

export function useUrlPlayerManagement() {
    const [compareList, setCompareList] = useState<Player[]>([]);
    const [initialLoadComplete, setInitialLoadComplete] = useState(false);

    // Read player IDs from URL and fetch player data on mount
    useEffect(() => {
        const loadPlayersFromUrl = async () => {
            // Get player IDs from URL query parameters
            const params = new URLSearchParams(window.location.search);
            const playerIds = params.get('id')?.split(',').filter(Boolean) || [];

            if (playerIds.length > 0) {
                // Fetch player data for each ID
                const players = await Promise.all(
                    playerIds.map(async (id) => {
                        // Fetch one rating to get the player name
                        const data = await fetchPlayerRatings(id);
                        const name = data.length > 0 ? data[0].name : id;
                        // Assign a consistent color for this player
                        const color = randomColor();
                        return { id, name, color };
                    })
                );
                setCompareList(players);
            } else {
                // Set default player if no IDs in URL
                setCompareList([{ id: "3267849", name: "Nguyen Anh Kiet", color: randomColor() }]);
            }
            setInitialLoadComplete(true);
        };

        loadPlayersFromUrl();
    }, []);

    // Update URL when compareList changes
    useEffect(() => {
        if (!initialLoadComplete) return;

        // Create URL with player IDs
        const playerIds = compareList.map(player => player.id).join(',');
        const url = playerIds ? `?id=${playerIds}` : window.location.pathname;

        // Update browser URL without reloading the page
        window.history.replaceState({}, '', url);
    }, [compareList, initialLoadComplete]);

    return {
        compareList,
        setCompareList,
        initialLoadComplete
    };
}