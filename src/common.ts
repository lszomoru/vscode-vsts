import { QuickPickItem } from "vscode";

export class WorkItemQuickPickItem implements QuickPickItem {
	label:string;
	description:string;
	id: string;
}

export class WorkItemQueryQuickPickItem implements QuickPickItem {
	label:string;
	description:string;
	wiql: string;
}

export class GitRepoDetails {
	url: string;
	branch: string;
	path: string;
}