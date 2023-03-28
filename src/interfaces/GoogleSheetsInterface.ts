import fs from "fs/promises";
import {google} from "googleapis";
import {CREDENTIALS_PATH, TOKEN_PATH} from "../config/environment";

class GoogleSheetsInterface {
    /**
     * Reads previously authorized credentials from the save file.
     *
     * @return {Promise<OAuth2Client|null>}
     */
    async loadSavedCredentialsIfExist() {
        try {
            const content = (await fs.readFile(TOKEN_PATH)).toString();
            const credentials = JSON.parse(content);
            return google.auth.fromJSON(credentials);
        } catch (err) {
            return null;
        }
    }

    /**
     * Serializes credentials to a file comptible with GoogleAUth.fromJSON.
     *
     * @param {OAuth2Client} client
     * @return {Promise<void>}
     */
    async saveCredentials(client: any) {
        const content = (await fs.readFile(process.cwd() + '/' + CREDENTIALS_PATH)).toString();
        const keys = JSON.parse(content);
        const key = keys.installed || keys.web;
        const payload = JSON.stringify({
            type: 'authorized_user',
            client_id: key.client_id,
            client_secret: key.client_secret,
            refresh_token: client.credentials.refresh_token,
        });
        await fs.writeFile(process.cwd() + '/' + TOKEN_PATH, payload);
    }

    async update(auth: any, spreadsheetId: string, range: string, values: any[]): Promise<boolean> {
        const resource = {
            values,
        };

        const request = {
            spreadsheetId,
            range,
            valueInputOption: 'USER_ENTERED',
            resource,
            auth,
        };

        try {
            const sheets = google.sheets({version: 'v4', auth});
            await sheets.spreadsheets.values.update(request);
            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    }

    async create(auth: any, title: string): Promise<boolean> {
        const request = {
            resource: {
                title,
            },
            auth,
        };

        try {
            const sheets = google.sheets({version: 'v4', auth});
            await sheets.spreadsheets.create(request);
            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    }
}

const googleSheetsInterface = new GoogleSheetsInterface();
export {
    GoogleSheetsInterface,
    googleSheetsInterface
}
