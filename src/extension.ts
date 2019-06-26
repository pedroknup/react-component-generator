// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { ComponentGenerator } from './component.generator';
import { getWorkspaceFolder } from './utils/workspace-util';
import { commands, workspace, window, ExtensionContext } from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	const workspaceRoot: string = getWorkspaceFolder(workspace.workspaceFolders);
	const generator = new ComponentGenerator(workspaceRoot, window);
	let disposable = vscode.commands.registerCommand('extension.generateModuleComponent', () => {
		// The code you place here will be executed every time your command is executed
		generator.execute();
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
