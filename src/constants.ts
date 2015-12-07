export class Constants {
	static statusBarItemPriority: number = 99;
	static queryFolderName: string = "My Queries";
	static defaultCollectionName: string = "DefaultCollection";
}

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

	static languageNoSupported: string = "Creating a task from a selection only works in JavaScript, TypeScript, TypeScript React, and C# languages.";
	static multiLineSelectionNotSupported: string = "Creating a task from a selection only works with a single line selection.";
}

export class Icons {
	static account: string = "$(icon octicon-globe)";
	static teamProject: string = "$(icon octicon-organization)";
}

export class SettingNames {
	static accountName: string = "vsts.account";
	static personalAccessToken: string = "vsts.pat";
	static teamProjectName: string = "vsts.teamProject";
	static workItemTypes: string = "vsts.workItemTypes";
	static statusBarItemPriority: string = "vsts.statusBarItemPriority";
}

export class WorkItemFields {
	static id: string = "System.Id";
	static title: string = "System.Title";
	static workItemType: string = "System.WorkItemType";
}