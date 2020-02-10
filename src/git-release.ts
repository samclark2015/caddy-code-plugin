import { window, QuickPickItem, Selection } from "vscode";
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

const versionRegex = "^v([0-9]*).([0-9]*).([0-9]*)";
const latestCommand = "set -o pipefail && git tag | sort -r";

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
    exec(command, {...options, encoding: 'utf-8'}, (err, stdout, stderr) => {
      if (err) {
        reject({ err, stdout, stderr });
      } else resolve({ stdout, stderr });
    });
  });
}

function reportError(err: any) {
  console.error(err);
  window.showErrorMessage(`Release failed!\n${err}`);
}

export async function gitRelease() {
  try {
    let cwd = window.activeTextEditor?.document.uri.fsPath;
    cwd = cwd?.slice(0, cwd.lastIndexOf("/"));
    console.log(cwd)
    let result = await execute(latestCommand, { cwd });
    console.log(result.stdout);
    let regex = new RegExp(versionRegex, "g");
    let matches = regex.exec(result.stdout);
    let version = matches ? matches.slice(1, 4).map(parseInt) : [0, 0, 0];
    let selection = await window.showQuickPick(getItems(version), {
      canPickMany: false,
      placeHolder: "Release Type..."
    });
    if (selection) {
      result = await execute(selection?.command);
      window.showInformationMessage("Release succeeded!");
    }
  } catch (err) {
    reportError(err.stderr);
  }
}
