import { StatusBarItem, StatusBarAlignment, window, workspace } from "vscode";
import { Constants, Icons, Settings } from "./constants";

var rest = require("rest");
var open = require("open");

export class HealthService {
	private _healthIndicatorColors: any = { "GREEN": Icons.statusGreen, "YELLOW": Icons.statusYellow, "RED": Icons.statusRed };
	private _statusBarItem: StatusBarItem;
	private _supportWebsiteAddress: string;

	constructor() {
		this._statusBarItem = window.createStatusBarItem(StatusBarAlignment.Left, Constants.healthStatusBarItemPriority);
		this._statusBarItem.command = "extension.openVSTSSupportSite";
		this.updateStatusBarItem(Icons.statusUnknown, Constants.healthIndicatorTooltip);

		// Override the service status page from the configuration file
		this._supportWebsiteAddress = workspace.getConfiguration().get<string>(Settings.supportWebsiteAddress, Constants.supportWebsiteAddress);

		// Get the service status at the moment
		this.getServiceStatus();

		// Poll the service status every 5 minutes
		this.pollServiceStatus();
	}

	public openSupportSite(): void {
		open(this._supportWebsiteAddress);
	}

	private execRegEx(text:string, expr:string, flags:string):Array<string> {
		var regEx = new RegExp(expr, flags);
		return regEx.exec(text);
	}

	private getServiceStatus() :void {
		var _self = this;

		rest(this._supportWebsiteAddress).then(function(response) {
			if (response.status.code != 200) {
				_self.updateStatusBarItem(Icons.statusUnknown, Constants.healthIndicatorTooltip);
			} else {
				var icon = Icons.statusUnknown;
				var tooltip = Constants.healthIndicatorTooltip;

				// Extract the service status message from the HTML page
				var statusMessageResult = _self.execRegEx(response.entity, "<h1 xmlns=\"\">Visual Studio Team Services (\\w|\\W)*?</p>", "m");
				if (statusMessageResult && statusMessageResult.length > 0) {
					tooltip = statusMessageResult[0].substring(statusMessageResult[0].indexOf("<p") + 12, statusMessageResult[0].indexOf("</p"));
				}

				// Extract the service status from the HTML page
				for (var key in _self._healthIndicatorColors) {
					var statusResult = _self.execRegEx(response.entity, "<img id=\""+ key + "\"", "m");
					if (statusResult && statusResult.length > 0) {
						_self.updateStatusBarItem(_self._healthIndicatorColors[key], tooltip);
						break;
					}
				}
			}
		});
	}

	private pollServiceStatus(): void {
		// Poll the service status every 5 minutes
		setInterval(() => this.getServiceStatus(), 1000 * 60 * 5);
	}

	private updateStatusBarItem(icon:string, tooltip:string):void {
		this._statusBarItem.text = "VSTS " + icon;
		this._statusBarItem.tooltip = tooltip;
		this._statusBarItem.show();
	}

	dispose() {
		this._statusBarItem.dispose();
	}
}