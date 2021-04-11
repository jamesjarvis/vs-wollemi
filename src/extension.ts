// The module 'vscode' contains the VS Code extensibility API
import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  var extension = new PleaseWollemiExtension(context);
  extension.showOutputMessage();

  vscode.commands.registerCommand(
    "extension.vs-wollemi.enableOnSave",
    () => {
      extension.isEnabled = true;
    }
  );
  vscode.commands.registerCommand(
    "extension.vs-wollemi.disableOnSave",
    () => {
      extension.isEnabled = false;
    }
  );

  vscode.workspace.onDidSaveTextDocument((document: vscode.TextDocument) => {
    // The code you place here will be executed every time a file is saved.
    extension.onSaveFile(document);
  });

  // context.subscriptions.push();
}

export function deactivate() {}

interface WollemiConfig {
  // command: string
}

class PleaseWollemiExtension {
  private _outputChannel: vscode.OutputChannel;
  private _context: vscode.ExtensionContext;
  private _config: WollemiConfig;

  constructor(context: vscode.ExtensionContext) {
    this._context = context;
    this._outputChannel = vscode.window.createOutputChannel("vs-wollemi");
    this._config = <WollemiConfig>(
      (<any>vscode.workspace.getConfiguration("jamesjarvis.vs-wollemi"))
    );
  }

  public get isEnabled(): boolean {
    return !!this._context.globalState.get("isEnabled", true);
  }
  public set isEnabled(value: boolean) {
    this._context.globalState.update("isEnabled", value);
    this.showOutputMessage();
  }

  /**
   * Show basic message in output channel
   */
  public showOutputMessage(message?: string): void {
    message =
      message || `vs-wollemi ${this.isEnabled ? "enabled" : "disabled"}.`;
    this._outputChannel.appendLine(message);
  }

  public onSaveFile(document: vscode.TextDocument): void {
    if(!this.isEnabled) {
			this.showOutputMessage();
			return;
		}

    this._outputChannel.appendLine(
      "Damn looks like you save a file! " + document.fileName
    );
  }
}
