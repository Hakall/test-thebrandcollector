import { requireEnv } from "../utils/requireEnv";

export const PORT = requireEnv<number>("PORT");
export const ENV = requireEnv<"development" | "production">("ENV");
export const API_KEY = requireEnv("API_KEY");
export const JWT_SECRET = requireEnv("JWT_SECRET");
export const SPREADSHEET_ID = requireEnv("SPREADSHEET_ID");
export const OMDB_API_KEY = requireEnv("OMDB_API_KEY");
export const SCOPES = requireEnv("SCOPES");
export const TOKEN_PATH = requireEnv("TOKEN_PATH");
export const CREDENTIALS_PATH = requireEnv("CREDENTIALS_PATH");
