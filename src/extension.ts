// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { gitRelease } from "./git-release";
import { cookiecutterUpgrade } from "./cookiecutter-upgrade";
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable;
  disposable = vscode.commands.registerCommand("cad.release", gitRelease);
  context.subscriptions.push(disposable);

  disposable = vscode.commands.registerCommand("cad.upgrade", cookiecutterUpgrade);
  context.subscriptions.push(disposable);

}

// this method is called when your extension is deactivated
export function deactivate() {}
