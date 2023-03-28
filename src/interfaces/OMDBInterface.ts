import axios from 'axios';
import {OMDB_API_KEY} from "../config/environment";
import {GetParams, GetResult, OMDBType, SearchParams, SearchResponse, SearchResult} from "../models";

class OMDBInterface {
    private apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    public async get(query: GetParams): Promise<GetResult> {
        const response = await axios.get<GetResult>(`http://www.omdbapi.com/?apiKey=${this.apiKey}&i=${query.imdbID}`);
        if (response.data.Response === "False") {
            throw new Error(response.data.Error||"Erreur")
        }
        return response.data;
    }

    public async search(query: SearchParams): Promise<SearchResponse> {
        const page = query.page || 1;
        const type = query.type || OMDBType.movie;

        const response = await axios.get<SearchResponse>(`http://www.omdbapi.com/?apiKey=${this.apiKey}&s=${query.s}&type=${type}&page=${page}`);
        if (response.data.Response === "False") {
            throw new Error(response.data.Error||"Erreur")
        }
        return response.data;
    }
}

const omdbInterface = new OMDBInterface(OMDB_API_KEY);

export {
    OMDBInterface,
    omdbInterface,
}
