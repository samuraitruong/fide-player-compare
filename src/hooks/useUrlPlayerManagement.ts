import { useState, useEffect, useRef } from "react";
import { fetchPlayerRatings } from "./usePlayerRatings";
import { randomColor } from "@/util";
import { Player } from "@/types/player";

export function useUrlPlayerManagement() {
    const [compareList, setCompareList] = useState<Player[]>([]);
    const [initialLoadComplete, setInitialLoadComplete] = useState(false);
    const initialUrlPlayerIds = useRef<string[] | null>(null);

    // Read player IDs from URL and fetch player data on mount
    useEffect(() => {
        const loadPlayersFromUrl = async () => {
            // Get player IDs from URL query parameters
            const params = new URLSearchParams(window.location.search);
            const playerIds = params.get("id")?.split(",").map(s => s.trim()).filter(Boolean) || [];
            initialUrlPlayerIds.current = playerIds;

            if (playerIds.length > 0) {
                // Initialize synchronously so URL-sync effect can't race and wipe the query
                const initialPlayers: Player[] = playerIds.map((id) => ({ id, name: id, color: randomColor() }));
                setCompareList(initialPlayers);

                // Then enrich names asynchronously
                const enriched = await Promise.all(
                    initialPlayers.map(async (player) => {
                        const data = await fetchPlayerRatings(player.id);
                        const name = data.length > 0 ? data[0].name : player.id;
                        return { ...player, name };
                    })
                );
                setCompareList(enriched);
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

        // During initialization we may temporarily have an empty compareList;
        // avoid wiping out the incoming URL query in that case.
        if (compareList.length === 0) return;

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