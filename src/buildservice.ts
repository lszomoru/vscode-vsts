import { QuickPickItem, window, workspace } from "vscode";
import { IBuildApi } from "vso-node-api/BuildApi";
import { Build, BuildQueryOrder, BuildReason, BuildResult, BuildStatus, DefinitionQueryOrder, DefinitionReference, DefinitionType, QueryDeletedOption } from "vso-node-api/interfaces/BuildInterfaces";
import { WebApi, getBasicHandler } from "vso-node-api/WebApi";
import { Constants, Icons, Settings } from "./constants";
import { ErrorHandler, ErrorMessages } from "./errorhandler";
import { SettingService } from "./settingservice";

let open = require("open");

export class BuildService {
    private _vstsBuildClient: IBuildApi;
    private _vstsAccount: string;
    private _vstsTeamProject: string;

    constructor() {
		// Listen to configuration changes
        workspace.onDidChangeConfiguration(() => {
            this.initialize();
        });

		// Initialize the service
        this.initialize();
    }

    public openBuildDefinition(): void {
        let _self = this;
        window.showQuickPick(this.getBuilds())
            .then(
                function(definition: BuildDefinitionQuickPickItem) {
                    open("https://" + _self._vstsAccount + "/" + Constants.defaultCollectionName + "/" + _self._vstsTeamProject + "/_build#definitionId=" + definition.id.toString() + "&_a=completed");
                },
                function (err) {
                    console.log("ERROR: " + err.message);
                });
    }

    private initialize(): void {
		// Check that all the settings are set
        if (SettingService.checkSettings(false)) {
            // Get the settings
            this._vstsAccount = SettingService.getAccountName();
            this._vstsTeamProject = SettingService.getTeamProjectName();

            // Create the instance of the VSTS build client
            let pat = getBasicHandler("oauth", SettingService.getPersonalAccessToken());
            this._vstsBuildClient = new WebApi("https://" + this._vstsAccount + "/" + Constants.defaultCollectionName, pat).getBuildApi();
        }
    }

    private getBuilds(): Promise<Array<BuildDefinitionQuickPickItem>> {
        let _self = this;

        return new Promise<Array<BuildDefinitionQuickPickItem>>((resolve, reject) => {
            _self._vstsBuildClient.getDefinitions(_self._vstsTeamProject, "", DefinitionType.Build, "", "", DefinitionQueryOrder.None, 999,
                function(err, status, definitions: Array<DefinitionReference>) {
                    if (err) {
                        ErrorHandler.displayError(err, ErrorMessages.getBuildDefinitions);
                        reject(err);
                    } else {
                        let results: Array<BuildDefinitionQuickPickItem> = [];
                        let definitionIds: Array<number> = definitions.map(d => { return d.id; });

                        // Get the most recent build for each definition
                        _self._vstsBuildClient.getBuilds(_self._vstsTeamProject, definitionIds, [], "", null, null, "", BuildReason.All, BuildStatus.All,
                            null, [], [], DefinitionType.Build, 999, "", 1, QueryDeletedOption.ExcludeDeleted, BuildQueryOrder.FinishTimeDescending,
                            function (err, status, builds: Array<Build>) {
                                if (err) {
                                    ErrorHandler.displayError(err, ErrorMessages.getBuildDefinitionDetails);
                                    reject(err);
                                } else {
                                    definitions.forEach(d => {
                                        let description: string = "no builds exist for this build definition";
                                        let build = builds.find(b => { return b.definition.name === d.name; });

                                        if (build) {
                                            description = build.buildNumber + ", "
                                                + BuildResult[build.result.toString()] + ", "
                                                + BuildReason[build.reason.toString()] + ", "
                                                + build.requestedFor.displayName + ", "
                                                + build.finishTime.toLocaleString();
                                        }

                                        results.push({
                                            id: d.id,
                                            label: d.name,
                                            description: description
                                        });
                                    });
                                    resolve(results.sort((a, b) => {
                                        if (a.label > b.label) {
                                            return 1;
                                        }
                                        if (a.label < b.label) {
                                            return -1;
                                        }
                                        return 0;
                                    }));
                                }
                            });
                    }
                });
        });
    }
}

export class BuildDefinitionQuickPickItem implements QuickPickItem {
    label: string;
    description: string;
    id: number;
}