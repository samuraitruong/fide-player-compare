export type Player = {
    id: string;
    name: string;
    color: string;
};

export type RatingType = "rating" | "rapid_rtng" | "blitz_rtng";

// Player rating data type
export type PlayerRatingRow = {
    date_2: string;
    id_number: string;
    rating: number | null;
    period_games: number | null;
    rapid_rtng: number | null;
    rapid_games: number | null;
    blitz_rtng: number | null;
    blitz_games: number | null;
    name: string;
    country: string;
};

export type PlayerRatingData = PlayerRatingRow[];

export type FideSearchPlayer = {
    fideId: string;
    name: string;
};