import { commands, ExtensionContext, window, workspace } from "vscode";
import { HealthService } from "./healthservice";
import { VersionControlService } from "./versioncontrolservice";
import { WorkItemService } from "./workitemservice";

var healthService: HealthService;
var versionControlService: VersionControlService;
var workItemService: WorkItemService;

export function activate(context: ExtensionContext) {
	healthService = new HealthService();
	versionControlService = new VersionControlService();
	workItemService = new WorkItemService();

	// Service health commands
	context.subscriptions.push(commands.registerCommand("extension.openVSTSSupportSite", () => healthService.openSupportSite()));

	// Version control commands
	context.subscriptions.push(commands.registerCommand("extension.openInVSTS", () => versionControlService.openInVSTS()));
	context.subscriptions.push(commands.registerCommand("extension.annotateInVSTS", () => versionControlService.annotateInVSTS()));
	context.subscriptions.push(commands.registerCommand("extension.viewHistoryInVSTS", () => versionControlService.viewHistoryInVSTS()));
	context.subscriptions.push(commands.registerCommand("extension.viewPullRequestInVSTS", () => versionControlService.viewPullRequestInVSTS()));

	// Work item commands
	context.subscriptions.push(commands.registerCommand("extension.createVSTSWorkItem", () => workItemService.newWorkItem()));
	context.subscriptions.push(commands.registerCommand("extension.createVSTSTaskFromSelection", () => workItemService.newTaskFromSelection()));
	context.subscriptions.push(commands.registerCommand("extension.queryVSTSWorkItems", () => workItemService.queryWorkItems()));
	context.subscriptions.push(commands.registerCommand("extension.openVSTSWorkItemsPortal", () => workItemService.openPortal()));
}