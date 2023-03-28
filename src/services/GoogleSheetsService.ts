import {authenticate} from "@google-cloud/local-auth";
import {CREDENTIALS_PATH, SCOPES} from "../config/environment";
import {googleSheetsInterface} from "../interfaces";

class GoogleSheetsService {
    /**
     * Load or request or authorization to call APIs.
     *
     */
    async authorize () {
        let client: any = await googleSheetsInterface.loadSavedCredentialsIfExist();
        if (client) {
            return client;
        }

        client = await authenticate({
            scopes: SCOPES.split(','),
            keyfilePath: process.cwd() + '/' + CREDENTIALS_PATH,
        });

        console.log('client', client);

        if (client.credentials) {
            await googleSheetsInterface.saveCredentials(client);
        }
        return client;
    }

    async update(spreadsheetId: string, range: string, values: any[]) {
        const auth = await this.authorize();
        return googleSheetsInterface.update(auth, spreadsheetId, range, values);
    }

    async create() {
        const auth = await this.authorize();
        return googleSheetsInterface.create(auth, 'Pirates');
    }
}
const googleSheetsService = new GoogleSheetsService();
export {
    GoogleSheetsService,
    googleSheetsService
}
