import { commands, Position, QuickPickItem, Range, StatusBarAlignment, StatusBarItem, window, workspace } from "vscode";
import { WebApi, getBasicHandler } from "vso-node-api/WebApi";
import { TeamContext } from "vso-node-api/interfaces/CoreInterfaces";
import { IWorkItemTrackingApi } from "vso-node-api/WorkItemTrackingApi";
import { QueryExpand, Wiql, WorkItemExpand } from "vso-node-api/interfaces/WorkItemTrackingInterfaces";
import { Constants, Icons, Settings, WorkItemFields } from "./constants";
import { ErrorMessages, ErrorHandler } from "./errorhandler";
import { SettingService } from "./settingservice";

let open = require("open");

export class WorkItemService {
    private _vstsWitClient: IWorkItemTrackingApi;
    private _vstsAccount: string;
    private _vstsTeamProject: string;
    private _vstsWorkItemTypes: Array<string>;
    private _statusBarItem: StatusBarItem;

    constructor() {
		// Listen to configuration changes
        workspace.onDidChangeConfiguration(() => {
            this.initialize();
        });

		// Initialize the service
        this.initialize();
    }

    public newTaskFromSelection(): void {
        let _self = this;

		// Make sure we have an active editor 
        let editor = window.activeTextEditor;
        if (!editor) {
            return;
        }

		// Make sure that the language is supported
        if (editor.document.languageId !== "javascript" &&
            editor.document.languageId !== "typescript" &&
            editor.document.languageId !== "typescript react" &&
            editor.document.languageId !== "csharp") {
                window.showInformationMessage(ErrorMessages.languageNoSupported);
                return;
            }

		// Make sure that the selection is not empty and it is a single line 
        let selection = editor.selection;
        if (selection.isEmpty) {
            return;
        }

        if (!selection.isSingleLine) {
            window.showInformationMessage(ErrorMessages.multiLineSelectionNotSupported);
            return;
        }

        let range = new Range(selection.start.line, selection.start.character, selection.end.line, selection.end.character);
        let taskTitle = editor.document.getText(range).trim();


        if (this._vstsWitClient) {
            if (taskTitle && taskTitle.length > 0) {
				// Remove starting "/" characters 
                taskTitle = taskTitle.substr(taskTitle.search("\\w"));

				// Create the task using the title
                this.createWorkItem(taskTitle, "Task").then((id) => {
					// Copy the text for indentation 
                    let firstNonWhiteSpace: number = editor.document.lineAt(range.start.line).firstNonWhitespaceCharacterIndex;
                    let indentText: string = editor.document.getText(new Range(new Position(range.start.line, 0), new Position(range.start.line, firstNonWhiteSpace)));

					// Insert the work item link into source
                    editor.edit(edit => {
                        edit.insert(range.end, "\n" + indentText + "// https://" + this._vstsAccount + "/" + Constants.defaultCollectionName + "/" + this._vstsTeamProject + "/_workitems/edit/" + id);
                    });
                });
            }
        }
    }

    public newWorkItem(): void {
        let _self = this;

        if (this._vstsWitClient) {
			// Get the list of work item types
            window.showQuickPick(this.queryWorkItemTypes())
                .then(
                    function (workItemType: string) {
                        if (workItemType && workItemType.length > 0) {
							// Get the title of the new work item
                            window.showInputBox({
                                placeHolder: "Title of the " + workItemType + "."
                            }).then(function (title: string) {
                                if (title && title.length > 0) {
                                    // Create the new work item
                                    _self.createWorkItem(title, workItemType).then((id) => {
                                        window.showInformationMessage("Visual Studio Team Services work item " +  id + " created successfully.");
                                    });
                                }
                            });
                        }
                    },
                    function (err) {
                        console.log("ERROR: " + err.message);
                    });
        }
    }

    public openPortal() {
        if (this._vstsAccount !== "" && this._vstsTeamProject !== "") {
            open("https://" + this._vstsAccount + "/" + Constants.defaultCollectionName + "/" + this._vstsTeamProject + "/_workitems");
        }
    }

    public queryWorkItems(): void {
        let _self = this;

        if (this._vstsWitClient) {
			// Get the list of queries from the "My Queries" folder
            window.showQuickPick(this.queryWorkItemQueries())
                .then(
                    function (query) {
                        if (query) {
							// Execute the selected query and display the results
                            window.showQuickPick(_self.execWorkItemQuery({ query: query.wiql }))
                                .then(
                                    function (workItem) {
                                        open("https://" + _self._vstsAccount + "/" + Constants.defaultCollectionName + "/" + _self._vstsTeamProject + "/_workitems/edit/" + workItem.id);
                                    },
                                    function (err) {
                                        console.log("ERROR: " + err.message);
                                    });
                        }
                    },
                    function (err) {
                        console.log("ERROR: " + err.message);
                    });
        }
    }

    private createWorkItem(title: string, workItemType: string): Promise<number> {
        let _self = this;

        return new Promise<number>((resolve, reject) => {
            let newWorkItem = [{ op: "add", path: "/fields/" + WorkItemFields.title, value: title }];
            // TODO: This is broken. Waiting for the a fix.
            _self._vstsWitClient.createWorkItem(null, newWorkItem, _self._vstsTeamProject, workItemType, false, false, function(err, status, workItem)
            {
                if (err) {
                    console.log("ERROR: " + err.message);
                    ErrorHandler.displayError(err, ErrorMessages.createWorkItem);
                    reject();
                } else {
                    resolve(workItem.id);
                }
            });
        });
    }

    private execWorkItemQuery(wiql: Wiql): Promise<Array<WorkItemQuickPickItem>> {
        let _self = this;

        return new Promise((resolve, reject) => {
			// Execute the wiql and get the work item ids
            let teamContext: TeamContext = {
                projectId: undefined,
                project: _self._vstsTeamProject,
                teamId: undefined,
                team: undefined
            };

            _self._vstsWitClient.queryByWiql(wiql, teamContext, function(err, status, queryResult) {
                if (err) {
                    ErrorHandler.displayError(err, ErrorMessages.executeWorkItemQuery);
                    reject(err);
                } else {
					// Get the work item details
                    let workItemIds = queryResult.workItems.map(function(w) { return w.id; });

                    _self._vstsWitClient.getWorkItems(workItemIds, [WorkItemFields.id, WorkItemFields.title, WorkItemFields.workItemType], null, WorkItemExpand.None, function (err, status, workItems) {
                        if (err) {
                            ErrorHandler.displayError(err, ErrorMessages.getWorkItemDetails);
                            reject(err);
                        } else {
                            let results: Array<WorkItemQuickPickItem> = [];
                            for (let index = 0; index < workItems.length; index++) {
                                results.push({
                                    id: workItems[index].fields[WorkItemFields.id],
                                    label: workItems[index].fields[WorkItemFields.id] + "  [" + workItems[index].fields[WorkItemFields.workItemType] + "]",
                                    description: workItems[index].fields[WorkItemFields.title]
                                });
                            }
                            resolve(results);
                        }
                    });
                }
            });
        });
    }

    private initialize(): void {
		// Check that all the settings are set
        if (SettingService.checkSettings(false)) {
            // Get the settings
            this._vstsAccount = SettingService.getAccountName();
            this._vstsTeamProject = SettingService.getTeamProjectName();

            // Hide existing status bar item
            if (this._statusBarItem) {
                this._statusBarItem.hide();
            }

            // Add the details of the account and team project to the status bar
            this._statusBarItem = window.createStatusBarItem(StatusBarAlignment.Left, Constants.accountStatusBarItemPriority);
            this._statusBarItem.command = "extension.openVSTSPortal";
            this._statusBarItem.text = Icons.account + " " + this._vstsAccount.replace(".visualstudio.com", "") + " " + Icons.teamProject + " " + this._vstsTeamProject;
            this._statusBarItem.show();

            // Create the instance of the VSTS work item tracking client
            let pat = getBasicHandler("oauth", SettingService.getPersonalAccessToken());
            this._vstsWitClient = new WebApi("https://" + this._vstsAccount + "/" + Constants.defaultCollectionName, pat).getWorkItemTrackingApi();

            // Reset the work item types array
            this._vstsWorkItemTypes = [];
        }
    }

    private queryWorkItemQueries(): Promise<Array<WorkItemQueryQuickPickItem>> {
        let _self = this;

        return new Promise((resolve, reject) => {
            _self._vstsWitClient.getQueries(_self._vstsTeamProject, QueryExpand.Wiql, 1, false, function (err, status, queryHierarchy) {
                if (err) {
                    ErrorHandler.displayError(err, ErrorMessages.getWorkItemQueries);
                    reject(err);
                } else {
                    let results: Array<WorkItemQueryQuickPickItem> = [];
                    queryHierarchy.forEach(folder => {
                        if (folder && folder.name === Constants.queryFolderName) {
                            for (let index = 0; index < folder.children.length; index++) {
                                results.push({
                                    label: folder.children[index].name,
                                    description: "",
                                    wiql: folder.children[index].wiql
                                });
                            }
                        }
                    });

                    resolve(results);
                }
            });
        });
    }

    private queryWorkItemTypes(): Promise<Array<string>> {
        let _self = this;

        return new Promise((resolve, reject) => {
            if (_self._vstsWorkItemTypes.length > 0) {
                resolve(_self._vstsWorkItemTypes);
            } else {
                _self._vstsWitClient.getWorkItemTypes(_self._vstsTeamProject, function(err, status, workItemTypes) {
                    if (err) {
                        ErrorHandler.displayError(err, ErrorMessages.getWorkItemTypes);
                        reject(err);
                    } else {
						// Check against the work item types in the settings
                        let witTypes = SettingService.getWorkItemTypes();

                        for (let index = 0; index < workItemTypes.length; index++) {
                            if (!witTypes || witTypes.length === 0 || witTypes.indexOf(workItemTypes[index].name) !== -1) {
                                _self._vstsWorkItemTypes.push(workItemTypes[index].name);
                            }
                        }
                        resolve(_self._vstsWorkItemTypes);
                    }
                });
            }
        });
    }
}

export class WorkItemQuickPickItem implements QuickPickItem {
    label: string;
    description: string;
    id: string;
}

export class WorkItemQueryQuickPickItem implements QuickPickItem {
    label: string;
    description: string;
    wiql: string;
}