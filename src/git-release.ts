import { window, QuickPickItem, ProgressLocation } from "vscode";
import { exec, ExecException, ExecOptions } from "child_process";

interface ReleaseOption extends QuickPickItem {
  label: string;
  command: string;
  description?: string | undefined;
  detail?: string | undefined;
  picked?: boolean | undefined;
  alwaysShow?: boolean | undefined;
}

interface ExecResult {
  stdout: string;
  stderr: string;
  err?: ExecException;
}

const versionRegex = /^Current version:\s*v([0-9]*)\.([0-9]*)\.([0-9]*)/gm;
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

async function execute(
  command: string,
  options?: ExecOptions
): Promise<ExecResult> {
  return new Promise((resolve, reject) => {
    exec(command, { encoding: 'utf8', shell: "/usr/bin/tcsh", ...options }, (err, stdout, stderr) => {
      if (err) {
        reject({ err, stdout, stderr });
      } else resolve({ stdout, stderr });
    });
  });
}

function reportError(err: any, message?: string) {
  console.error(err);
  window.showErrorMessage(message || `Release failed! ${err}`);
}

export async function gitRelease() {
  try {
    let cwd = window.activeTextEditor?.document.uri.fsPath;
    cwd = cwd?.slice(0, cwd.lastIndexOf("/"));

    let result = await execute(latestCommand, { cwd });
    let matches = versionRegex.exec(result.stdout);
    let version = matches ? matches.slice(1, 4).map((val) => parseInt(val)) : [0, 0, 0];

    let selection = await window.showQuickPick(getItems(version), {
      canPickMany: false,
      placeHolder: "Release Type..."
    });
    if (selection) {
      let selection_ = selection;
      await window.withProgress({ location: ProgressLocation.Notification }, (progress) => {
        progress.report({message: "Release in progress..."});
        return execute(selection_.command, { cwd })
      });
      window.showInformationMessage("Release succeeded!");
    }
  } catch (err) {
    reportError(err.stderr);
  }
}
