// Plain async function to fetch player rating data for use outside hooks
export async function fetchPlayerRatings(id: string): Promise<RatingData> {
    if (!id) return [];
    const url = `https://ratings.fide.com/a_chart_data.phtml?event=${id}&period=0`;
    const proxyUrl = `https://no-cors.fly.dev/cors/${url}`;
    try {
        const res = await fetch(proxyUrl, { headers: { 'X-Requested-With': 'XMLHttpRequest' } });
        if (!res.ok) return [];
        const json = await res.json();
        if (Array.isArray(json) && json.length && typeof json[0] === 'object') {
            return json.map((row: any) => {
                // Normalize date_2 to YYYY-MM format for correct sorting
                let normalizedDate = row.date_2;
                if (normalizedDate) {
                    // FIDE format: e.g. "2025-May" or "2025"
                    const match = normalizedDate.match(/^(\d{4})-(\w{3})$/);
                    if (match) {
                        const monthMap: { [key: string]: string } = {
                            Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
                            Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12"
                        };
                        const month = monthMap[match[2]] || "01";
                        normalizedDate = `${match[1]}-${month}`;
                    } else if (/^\d{4}$/.test(normalizedDate)) {
                        normalizedDate = `${normalizedDate}-01`;
                    }
                }
                return {
                    ...row,
                    date_2: normalizedDate,
                    rating: row.rating !== null ? Number(row.rating) : null,
                    period_games: row.period_games !== null ? Number(row.period_games) : null,
                };
            });
        } else {
            return [];
        }
    } catch {
        return [];
    }
}
// Custom hook to fetch player rating data (mocked for now)
import { useEffect, useState } from "react";

type RatingData = {
    date_2: string;
    id_number: string;
    rating: string;
    period_games: string;
    rapid_rtng: string;
    rapid_games: string;
    blitz_rtng: string;
    blitz_games: string;
    name: string;
    country: string;
}[];

export function usePlayerRatings(id: string): RatingData {
    const [data, setData] = useState<RatingData>([]);

    useEffect(() => {
        if (!id) return;
        const url = `https://ratings.fide.com/a_chart_data.phtml?event=${id}&period=0`;
        const proxyUrl = `https://no-cors.fly.dev/cors/${url}`;
        fetch(proxyUrl, { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
            .then(res => res.ok ? res.json() : Promise.reject('Failed to fetch'))
            .then(json => {
                // If already array of objects, just map and convert rating/period_games to number
                if (Array.isArray(json) && json.length && typeof json[0] === 'object') {
                    setData(json.map((row: any) => ({
                        ...row,
                        rating: row.rating !== null ? Number(row.rating) : null,
                        period_games: row.period_games !== null ? Number(row.period_games) : null,
                    })));
                } else {
                    setData([]);
                }
            })
            .catch(() => setData([]));
    }, [id]);

    return data;
}
