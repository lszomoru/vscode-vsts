import { window, workspace } from "vscode";

var gitConfig = require("parse-git-config");
var gitRepoInfo = require("git-repo-info");
var urlencode = require("urlencode");
var open = require("open");

export class VersionControlService {

	public openInVSTS(): void {
		let gitRepoDetails:GitRepoDetails = this.getRepoDetails();

		if (gitRepoDetails) {
			open(gitRepoDetails.url + "#path=" + urlencode(gitRepoDetails.path) + "&version=GB"+ urlencode(gitRepoDetails.branch) + "&_a=contents");
		}
	}

	public annotateInVSTS(): void {
		let gitRepoDetails:GitRepoDetails = this.getRepoDetails();

		// TODO: Display an error message if no file is opened
		if (gitRepoDetails && gitRepoDetails.path != "/") {
			open(gitRepoDetails.url + "#path=" + urlencode(gitRepoDetails.path) + "&version=GB"+ urlencode(gitRepoDetails.branch) + "&_a=contents&annotate=true");
		}
	}

	public viewHistoryInVSTS(): void {
		let gitRepoDetails:GitRepoDetails = this.getRepoDetails();

		if (gitRepoDetails) {
			open(gitRepoDetails.url + "#path=" + urlencode(gitRepoDetails.path) + "&version=GB"+ urlencode(gitRepoDetails.branch) + "&_a=history");
		}
	}

	public viewPullRequestInVSTS(): void {
		let gitRepoDetails:GitRepoDetails = this.getRepoDetails();

		if (gitRepoDetails) {
			open(gitRepoDetails.url + "/pullrequests");
		}
	}

	private getRepoDetails(): GitRepoDetails {
		if (!workspace || !workspace.rootPath) {
			// TODO: Display a warning message
			return null;
		}

		// Get the url of the repo
		let config = gitConfig.sync({ path: workspace.rootPath + "/.git/config" });
		let url:string = config["remote \"origin\""].url;

		// Check if the repo is hosted on visualstudio.com
		if (!url || url.indexOf(".visualstudio.com") == -1) {
			// TODO: Display a warning message
			return null;
		}

		// Get the branch name and open the website
		let info = gitRepoInfo(workspace.rootPath + "/.git");

		let path:string = "/";
		let editor = window.activeTextEditor;

		if (editor) {
			path = editor.document.uri.path.substring(workspace.rootPath.length + 1);
		}

		return { url: url, branch: info.branch, path: path };
	}
}

export class GitRepoDetails {
	url: string;
	branch: string;
	path: string;
}