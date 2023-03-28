export enum OMDBType {
    movie = "movie",
    game = "game",
    series = "series",
    episode = "episode",
}

export interface GetResult {
    Error?: string;
    Title: string;
    Year: string;
    Rated: string;
    Released: string; // date
    Runtime: string;
    Genre: string;
    Director: string;
    Writer: string;
    Actors: string;
    Plot: string;
    Language: string;
    Country: string;
    Awards: string;
    Poster: string;
    Ratings: {
        Source: string;
        Value: string;
    }[],
    Metascore: string; // number
    imdbRating: string; // number
    imdbVotes: string; // number
    imdbID: string;
    Type: OMDBType;
    DVD: string; // date
    BoxOffice: string;
    Production: string;
    Website: string;
    Response: "True" | "False";
}

export interface GetParams {
    imdbID: string;
}

export interface SearchParams {
    s: string;
    type?: OMDBType;
    y?: string;
    r?: "json" | "xml";
    page?: number; // 1-100
}

export interface SearchResult {
    Title: string;
    Year: string;
    imdbID: string;
    Type: OMDBType;
    Poster: string; // url
}

export interface SearchResponse {
    Search: SearchResult[],
    Error?: string;
    totalResults: string; // number
    Response: "True" | "False";
}
