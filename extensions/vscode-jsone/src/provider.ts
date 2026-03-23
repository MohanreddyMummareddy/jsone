/**
 * VS Code Custom Editor Provider for jsone files
 */

import * as vscode from 'vscode';
import * as fs from 'fs';

class JsononeDocument implements vscode.CustomDocument {
  constructor(public uri: vscode.Uri) {}

  dispose(): void {
    // Cleanup
  }
}

export class JsononeTableEditorProvider implements vscode.CustomEditorProvider<JsononeDocument> {
  private readonly _onDidChangeCustomDocument = new vscode.EventEmitter<
    vscode.CustomDocumentEditEvent<JsononeDocument>
  >();
  readonly onDidChangeCustomDocument = this._onDidChangeCustomDocument.event;

  constructor(private context: vscode.ExtensionContext) {}

  async openCustomDocument(
    uri: vscode.Uri,
    openContext: vscode.CustomDocumentOpenContext,
    token: vscode.CancellationToken
  ): Promise<JsononeDocument> {
    return new JsononeDocument(uri);
  }

  async resolveCustomEditor(
    document: JsononeDocument,
    webviewPanel: vscode.WebviewPanel,
    token: vscode.CancellationToken
  ): Promise<void> {
    webviewPanel.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.joinPath(this.context.extensionUri, 'media'),
        vscode.Uri.joinPath(this.context.extensionUri, 'dist'),
      ],
    };

    // Read file content
    const fileContent = fs.readFileSync(document.uri.fsPath, 'utf-8');

    // Build HTML for webview
    const html = this.getWebviewContent(webviewPanel.webview, fileContent);
    webviewPanel.webview.html = html;

    // Handle messages from webview
    webviewPanel.webview.onDidReceiveMessage((message: any) => {
      switch (message.command) {
        case 'copyCSV':
          vscode.env.clipboard
            .writeText(message.csv)
            .then(() => {
              vscode.window.showInformationMessage('CSV copied to clipboard!');
            });
          break;
      }
    });

    // Handle file changes
    const changeDisposable = vscode.workspace.onDidChangeTextDocument((e: any) => {
      if (e.document.uri.fsPath === document.uri.fsPath) {
        const newContent = e.document.getText();
        webviewPanel.webview.postMessage({
          command: 'update',
          data: newContent,
        });
      }
    });

    webviewPanel.onDidDispose(() => {
      changeDisposable.dispose();
    });
  }

  async saveCustomDocument(
    document: JsononeDocument,
    cancellation: vscode.CancellationToken
  ): Promise<void> {
    // Read-only viewer
  }

  async saveCustomDocumentAs(
    document: JsononeDocument,
    destination: vscode.Uri,
    cancellation: vscode.CancellationToken
  ): Promise<void> {
    // Read-only viewer
  }

  async revertCustomDocument(
    document: JsononeDocument,
    cancellation: vscode.CancellationToken
  ): Promise<void> {
    // Read-only viewer
  }

  async backupCustomDocument(
    document: JsononeDocument,
    context: vscode.CustomDocumentBackupContext,
    cancellation: vscode.CancellationToken
  ): Promise<vscode.CustomDocumentBackup> {
    return { id: 'backup', delete: () => {} };
  }

  private getWebviewContent(webview: vscode.Webview, fileContent: string): string {
    const viewerPath = vscode.Uri.joinPath(
      this.context.extensionUri,
      'media',
      'viewer.html'
    );

    let viewerContent = fs.readFileSync(viewerPath.fsPath, 'utf-8');

    // Inject file content as data
    viewerContent = viewerContent.replace(
      '<!-- DATA_PLACEHOLDER -->',
      `<script>
        const jsoneData = ${JSON.stringify(fileContent)};
      </script>`
    );

    return viewerContent;
  }
}
