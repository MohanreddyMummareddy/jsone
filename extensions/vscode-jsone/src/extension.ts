/**
 * VS Code Extension for jsone
 * Custom editor for .jsone files with table view
 */

import * as vscode from 'vscode';
import { JsononeTableEditorProvider } from './provider';

export function activate(context: vscode.ExtensionContext) {
  // Register custom editor provider
  context.subscriptions.push(
    vscode.window.registerCustomEditorProvider(
      'jsone.tableEditor',
      new JsononeTableEditorProvider(context)
    )
  );

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand('jsone.copyCSV', () => {
      vscode.window.showInformationMessage('CSV copied to clipboard');
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('jsone.toggleColumns', () => {
      vscode.window.showInformationMessage('Toggle columns');
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('jsone.toggleTreeView', () => {
      vscode.window.showInformationMessage('Toggle tree view');
    })
  );

  console.log('jsone extension activated!');
}

export function deactivate() {}
