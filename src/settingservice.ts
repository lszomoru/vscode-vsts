import { window, workspace } from "vscode";
import { Constants, Settings } from "./constants";
import { ErrorMessages } from "./errorhandler";

export class SettingService {

    private static get<T>(section: string, defaultValue?: T): T {
        let configuration = workspace.getConfiguration();
        return configuration.get<T>(section, defaultValue);
    }

    static getAccountName(): string {
        return this.get<string>(Settings.accountName);
    }

    static getPersonalAccessToken(): string {
        return this.get<string>(Settings.personalAccessToken);
    }

    static getTeamProjectName(): string {
        return this.get<string>(Settings.teamProjectName);
    }

    static getWorkItemTypes(): Array<string> {
        return this.get<Array<string>>(Settings.workItemTypes, []);
    }

    static getSupportWebsiteAddress(): string {
        return this.get<string>(Settings.supportWebsiteAddress, Constants.supportWebsiteAddress);
    }

    static checkSettings(showWarnings: boolean = true): boolean {
        // vsts.account
        let account = this.get<string>(Settings.accountName, "");
        if (account === "") {
            if (showWarnings) {
                window.showWarningMessage(ErrorMessages.accountNameMissing);
            }
            return false;
        }

        // vsts.pat
        let pat = this.get<string>(Settings.personalAccessToken, "");
        if (pat === "") {
            if (showWarnings) {
                window.showWarningMessage(ErrorMessages.personalAccessTokenMissing);
            }
            return false;
        }

        // vsts.teamProject
        let teamProject = this.get<string>(Settings.teamProjectName, "");
        if (teamProject === "") {
            if (showWarnings) {
                window.showWarningMessage(ErrorMessages.teamProjectNameMissing);
            }
            return false;
        }

        return true;
    }
}