import { window, ProgressLocation } from "vscode";
import { execute, reportError } from "./utils";

/**
 * Command to upgrade project using given cookiecutter template
 */
export async function cookiecutterUpgrade() {
    try {
        const result = await window.withProgress({ location: ProgressLocation.Notification }, (progress) => {
            progress.report({ message: "Upgrading from Cookiecutter template..." });
            return execute("caddy upgrade-project");
        });
        window.showInformationMessage("Upgrade succeeded!");
    } catch (err) {
        reportError(err);
    }
}

