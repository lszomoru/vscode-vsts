import { commands, window } from "vscode";

export class ErrorMessages {
    static accountNameMissing: string = "Please set the Visual Studio Team Services account (vsts.account) in your settings.json.";
    static personalAccessTokenMissing: string = "Please set the personal access token (vsts.pat) for the Visual Studio Team Services account in your settings.json.";
    static teamProjectNameMissing: string = "Please set the team project name (vsts.teamProject) within the Visual Studio Team Services account in your settings.json.";

    static createWorkItem: string = "Unable to create work item.";
    static getWorkItemQueries: string = "Unable to retrieve work item queries.";
    static getWorkItemTypes: string = "Unable to retrieve work item types.";
    static getWorkItemDetails: string = "Unable to retrieve work item details.";
    static executeWorkItemQuery: string = "Unable to execute work item query.";

    static accountNotFoundHint: string = "Please ensure that the Visual Studio Team Services account name in settings.json is corect.";
    static teamProjectNotFoundHint: string = "Please ensure that the Visual Studio Team Services team project name in settings.json is corect.";
    static insufficientPermissionsHint: string = "Please ensure that the Visual Studio Team Services personal access token in settings.json has work item read/write permissions.";
    static generalHint: string = "Please ensure that the Visual Studio Team Services settings in settings.json are corect.";

    static notSupported: string = "Visual Studio Team Services git commands are only supported with git repositories that are hosted in Visual Studio Team Services.";
    static noFileToAnnotate: string = "To use annotate in Visual Studio Team Services please open a file from a git repository hosted in Visual Studio Team Services.";

    static languageNoSupported: string = "Creating a task from a selection only works in JavaScript, TypeScript, TypeScript React, and C# languages.";
    static multiLineSelectionNotSupported: string = "Creating a task from a selection only works with a single line selection.";
}

export class ErrorHandler {
    static displayError(err, message: string, openSettings: boolean = true): void {
        if (err) {
            let message = err.hasOwnProperty("message") ? err.message : err;

            if (message.indexOf("The resource cannot be found") > -1) {
				// Wrong account name
                window.showErrorMessage(message + " " + ErrorMessages.accountNotFoundHint);
            } else if (message.indexOf("TF200016") > -1) {
				// Wrong team project name
                window.showErrorMessage(message + " " + ErrorMessages.teamProjectNotFoundHint);
            } else if (message.indexOf("Error unauthorized") > -1) {
				// Insufficient permissions
                window.showErrorMessage(message + " " + ErrorMessages.insufficientPermissionsHint);
            } else {
				// Generic hint
                window.showErrorMessage(message + " " + ErrorMessages.generalHint);
            }
        } else {
			// Generic hint
            window.showErrorMessage(message + " " + ErrorMessages.generalHint);
        }

		// Open the settings file if needed
        if (openSettings) {
            commands.executeCommand("workbench.action.openGlobalSettings");
        }
    }
}