import { window, ProgressLocation } from "vscode";
import { execute, reportError } from "./utils";

export async function cookiecutterUpgrade() {

    try {
        const result = await window.withProgress({ location: ProgressLocation.Notification }, (progress) => {
            progress.report({ message: "Upgrading from Cookiecutter template..." });
            return execute("cookiecutter-upgrade");
        });
        window.showInformationMessage("Upgrade succeeded!");
    } catch (err) {
        reportError(err);
    }
}

