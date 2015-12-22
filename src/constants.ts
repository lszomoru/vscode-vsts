export class Constants {
    static accountStatusBarItemPriority: number = 99;
    static queryFolderName: string = "My Queries";
    static defaultCollectionName: string = "DefaultCollection";

    static healthStatusBarItemPriority: number = 100;
    static healthIndicatorTooltip: string = "Visual Studio Team Services health indicator";
    static supportWebsiteAddress: string = "https://www.visualstudio.com/support/support-overview-vs";
}

export class Icons {
    static statusUnknown: string = "$(icon octicon-question)";
    static statusGreen: string = "$(icon octicon-check)";
    static statusYellow: string = "$(icon octicon-alert)";
    static statusRed: string = "$(icon octicon-stop)";

    static account: string = "$(icon octicon-globe)";
    static teamProject: string = "$(icon octicon-organization)";
}

export class Settings {
    static accountName: string = "vsts.account";
    static personalAccessToken: string = "vsts.pat";
    static teamProjectName: string = "vsts.teamProject";
    static workItemTypes: string = "vsts.workItemTypes";
    static supportWebsiteAddress: string = "vsts.supportWebsiteAddress";
}

export class WorkItemFields {
    static id: string = "System.Id";
    static title: string = "System.Title";
    static workItemType: string = "System.WorkItemType";
}