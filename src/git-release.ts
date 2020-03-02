import { window, workspace, QuickPickItem, ProgressLocation, commands } from "vscode";
import { execute, reportError } from "./utils";

/**
 * Convert result code to string 
 * @param code Return code from caddy process
 * @returns Human-readable error condition
 */
function errorMessage(code: number) {
  switch (code) {
    case 1: return "No commits made since last release.";
    case 2: return "Behind latest release on origin.";
    case 3: return "Bad option given.";
    case 4: return "Pre-release hook failed.";
    default: return "Unknown error.";
  }
}

interface ReleaseOption extends QuickPickItem {
  label: string;
  command: string;
  description?: string | undefined;
  detail?: string | undefined;
  picked?: boolean | undefined;
  alwaysShow?: boolean | undefined;
}



const latestCommand = "git release current";

function getItems(version: number[]): ReleaseOption[] {
  const current = version.join(".");
  const [major, minor, patch] = version;
  return [
    {
      label: "Patch",
      detail: `[v${current} -> ${major}.${minor}.${patch + 1}]`,
      command: "git release patch"
    },
    {
      label: "Minor",
      detail: `[v${current} -> ${major}.${minor + 1}.0]`,
      command: "git release minor"
    },
    {
      label: "Major",
      detail: `[v${current} -> ${major + 1}.0.0]`,
      command: "git release major"
    }
  ];
}

/**
 * Execute the git semantic versioning release using the caddy tool, prompting the user for a version as input
 * @returns Nothing
 */
export async function gitRelease() {
  const versionRegex = /^Current version:\s*v([0-9]*)\.([0-9]*)\.([0-9]*)/gm;

  let cwd: string | undefined;
  if (workspace.workspaceFolders) {
    if (workspace.workspaceFolders?.length > 1) {
      let result = await window.showWorkspaceFolderPick();
      cwd = result?.uri.fsPath;
    } else {
      cwd = workspace.workspaceFolders[0].uri.fsPath;
    }
  }

  if (!cwd) {
    window.showErrorMessage("Invalid workspace selection.");
    return;
  }

  try {
    const result = await window.withProgress({ location: ProgressLocation.Notification }, (progress) => {
      progress.report({ message: "Fetching latest release..." });
      return execute(latestCommand, { cwd });
    });
    let matches = versionRegex.exec(result.stdout);
    let version = matches ? matches.slice(1, 4).map((val) => parseInt(val)) : [0, 0, 0];

    let selection = await window.showQuickPick(getItems(version), {
      canPickMany: false,
      placeHolder: "Release Type..."
    });
    if (selection) {
      let selection_ = selection;
      await window.withProgress({ location: ProgressLocation.Notification }, (progress) => {
        progress.report({ message: "Release in progress..." });
        return execute(selection_.command, { cwd });
      });
      window.showInformationMessage("Release succeeded!");
    }
  } catch (err: any) {
    reportError(err, errorMessage(err.code));
    if (err.code === 1 || err.code === 2) {
      commands.executeCommand("workbench.scm.focus");
    }
  }
}
