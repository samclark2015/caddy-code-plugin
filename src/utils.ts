import { exec, ExecException, ExecOptions, ChildProcess } from "child_process";
import { window } from "vscode";

export interface ExecResult extends ExecException {
    process: ChildProcess;
    stdout: string;
    stderr: string;
}

/**
 * Helper command to execute arbitrary system commands.
 * @param command Command to execute
 * @param options Options to pass to command
 * @returns Result of execution
 */
export async function execute(
    command: string,
    options?: ExecOptions
): Promise<ExecResult> {
    let cwd = window.activeTextEditor?.document.uri.fsPath;
    cwd = cwd?.slice(0, cwd.lastIndexOf("/"));
    return new Promise((resolve, reject) => {
        const process = exec(command, { cwd, encoding: 'utf8', shell: "/usr/bin/tcsh", ...options }, (err, stdout, stderr) => {
            if (err) {
                reject({ ...err, process, stdout, stderr });
            } else {
                resolve({ name: "Success", message: "Process completed", process, stdout, stderr });
            }
        });
    });
}

export function reportError(err: any, message?: string) {
    // Report error gracefully
    console.error(err);
    window.showErrorMessage(`Release failed! ${message}`);
}