import promiseLimit from "promise-limit";

import {omdbInterface} from "../interfaces/OMDBInterface";
import {googleSheetsService} from "./GoogleSheetsService";
import {BrandCollectorMovie, SearchResult} from "../models";
import {SPREADSHEET_ID} from "../config/environment";

const HEADERS_LABELS: BrandCollectorMovie = {
    Poster: 'Image',
    Title: 'Titre',
    Year: 'Année',
    Director: 'Réalisateur',
    before2015: 'Avant 2015',
    withPaulWalker: 'Avec Paul Walker',
    starWarsActors: 'Acteurs de Star Wars',
};

// we could use omdb api, but we cannot know if result is a true star wars movie
const STAR_WARS_ACTORS = [
    'Mark Hamill',
    'Harrison Ford',
    'Carrie Fisher',
    'Liam Neeson',
    'Natalie Portman',
    'Hayden Christensen',
    'Ewan McGregor',
    'Daisy Ridley',
    'John Boyega',
    'Oscar Isaac',
];

// used to avoid flooding OMDB api, we limit concurrency to 10 calls
const limit = promiseLimit<any>(10);

class BrandCollectorService {
    public async pirates(): Promise<BrandCollectorMovie[]> {
        const movies = await this.search('Pirates of the Caribbean')
        const headers = [HEADERS_LABELS.Title, HEADERS_LABELS.Director, HEADERS_LABELS.Poster, HEADERS_LABELS.Year, HEADERS_LABELS.withPaulWalker, HEADERS_LABELS.before2015, HEADERS_LABELS.starWarsActors];

        await googleSheetsService.update(SPREADSHEET_ID, 'Feuille 1', [headers,
            ...movies.map((m) =>
                [m.Title, m.Director, m.Poster, m.Year, m.withPaulWalker, m.before2015, m.starWarsActors])]);

        return movies;
    }

    public async _search(s: string): Promise<SearchResult[]> {
        const movies: SearchResult[] = [];

        const searchOmdb = async (page = 1) => {
            const response = await omdbInterface.search({s, page});
            if (!response.Search) return;

            response.Search.map((searchResult) => movies.push(searchResult));
            const lastPage = Math.ceil(Number(response.totalResults) / 10); // Omdb api returns 10 result per page
            if (lastPage !== page) {
                await searchOmdb(page + 1);
            }
        }

        await searchOmdb(1);

        return movies;
    }

    public async search(s: string): Promise<BrandCollectorMovie[]> {
        const movies = await this._search(s);
        const moviesComplete = await Promise.all(movies.map(async ({imdbID}) => limit(async () => this.movieMapper(imdbID))));

        return moviesComplete;
    }

    public async fastAndFurious(): Promise<BrandCollectorMovie[]> {
        return this.search('fast furious');
    }

    private async movieMapper(imdbID: string): Promise<BrandCollectorMovie> {
        const getMovie = await omdbInterface.get({imdbID});
        const withPaulWalker = getMovie.Actors.includes('Paul Walker');
        const before2015 = Number(getMovie.Year) < 2015;

        const actors = getMovie.Actors.split(',');
        const starWarsActors = actors
            .filter(actor => STAR_WARS_ACTORS.includes(actor.trim()))
            .map((actor) => actor.trim());

        let mapped: BrandCollectorMovie = {
            Title: getMovie.Title,
            Poster: getMovie.Poster,
            Director: getMovie.Director,
            Year: getMovie.Year,
            withPaulWalker: withPaulWalker ? '✅' : '❌',
            before2015: before2015 ? '✅' : '❌',
            starWarsActors: starWarsActors.join(', '),
        };

        return mapped;
    }
}

const brandCollectorService = new BrandCollectorService();

export {
    BrandCollectorService, brandCollectorService,
}
