# Visual Studio Team Services extension
Using the Visual Studio Team Services extension for Visual Studio Code you can keep an eye on the health of Visual Studio Team Services using the status bar indicator as well as use the commands available in the [command palette](https://code.visualstudio.com/docs/editor/codebasics#_command-palette) to perform version control, and work item tracking actions against your Visual Studio Team Services acount.

## Installation
Before [installing](https://code.visualstudio.com/docs/editor/extension-gallery#_browse-extensions) this extension, if you have installed any of the two extensions listed below, please  [uninstall](https://code.visualstudio.com/docs/editor/extension-gallery#_uninstall-an-extension) them as the features included in those extensions have been ported into this extension along with extra functionality that is availability only in this extension.
* [Visual Studio Team Services health indicator](https://marketplace.visualstudio.com/items/lszomoru.vscode-vsts-status)
* [Visual Studio Team Services work item management extension](https://marketplace.visualstudio.com/items/lszomoru.vscode-vsts-workitems)

## Configuration 
In order for the extension to access your Visual Studio Team Servies account you need to provide the account name, team project name, and a [personal access token](https://www.visualstudio.com/en-us/news/2015-jul-7-vso.aspx) with "work items (read and write)" permission. After installing the extension, and restarting Visual Studio Code, add the following settings into ```settings.json```:
```
	// Visual Studio Team Services account (Ex: contoso.visualstudio.com).
	"vsts.account": "",

	// Visual Studio Team Services personal access token.
	"vsts.pat": "",

	// Visual Studio Team Services team project name.
	"vsts.teamProject": ""
```
Additionally you can add an optional setting to control the work item types that can be created using Visual Studio Code.
```
	// Visual Studio Team Services work item types. (Ex: ["Bug", "Task"])
	"vsts.workItemTypes": [],
```

## Changelog
### v0.0.1
* Visual Studio Team Service health indicator on the status bar
* Visual Studio Team Services account/team project indicator on the status bar
* Open Visual Studio Team Services work items portal
* Create/query Visual Studio Team Services work items
* Create new task from a single-line text selection (JavaScript, TypeScript, TypeScript React, C#)
* Open/annotate file, view history/pull requests in Visual Studio Team Services

## License
MIT. For more details check [LICENSE](LICENSE).
