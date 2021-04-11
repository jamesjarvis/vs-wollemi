// The module 'vscode' contains the VS Code extensibility API
import {
  workspace,
  commands,
  TextDocument,
  OutputChannel,
  window,
  Uri,
} from "vscode";
import * as path from "path";
import { exec } from "child_process";

export function activate() {
  var extension = new PleaseWollemiExtension();
  extension.showOutputMessage();

  workspace.onDidChangeConfiguration(() => {
    extension.showOutputMessage("vs-wollemi: Reloading config.");
    extension.loadConfig();
  });

  commands.registerCommand("vs-wollemi.enableOnSave", () => {
    workspace.getConfiguration("vs-wollemi").update("runOnSave", true, true);
  });
  commands.registerCommand("vs-wollemi.disableOnSave", () => {
    workspace.getConfiguration("vs-wollemi").update("runOnSave", false, true);
  });

  workspace.onDidSaveTextDocument((document: TextDocument) => {
    // The code you place here will be executed every time a file is saved.
    extension.onSaveFile(document);
  });
}

export function deactivate() {}

interface WollemiConfig {
  runOnSave: boolean;
  autoClearConsole: boolean;
  shell: string;
  wollemiCommand: string;
}

class PleaseWollemiExtension {
  private _outputChannel: OutputChannel;
  private _config: WollemiConfig;

  constructor() {
    this._outputChannel = window.createOutputChannel("vs-wollemi");
    this._config = this.loadConfig();
    console.log(this._config);
  }

  public loadConfig(): WollemiConfig {
    let config = <WollemiConfig>{};
    config.autoClearConsole = workspace
      .getConfiguration("vs-wollemi")
      .get("autoClearConsole", true);
    config.runOnSave = workspace
      .getConfiguration("vs-wollemi")
      .get("runOnSave", true);
    config.shell = workspace.getConfiguration("vs-wollemi").get("shell", "");
    config.wollemiCommand = workspace
      .getConfiguration("vs-wollemi")
      .get("wollemiCommand", "wollemi");
    this._config = config;
    return config;
  }

  public get isEnabled(): boolean {
    return this._config.runOnSave;
  }
  public get shell(): string {
    return this._config.shell;
  }
  public get wollemiCommand(): string {
    return this._config.wollemiCommand;
  }
  public get autoClearConsole(): boolean {
    return this._config.autoClearConsole;
  }

  /**
   * Show message in output channel
   */
  public showOutputMessage(message?: string): void {
    message =
      message || `vs-wollemi ${this.isEnabled ? "enabled" : "disabled"}.`;
    this._outputChannel.appendLine(message);
  }

  public onSaveFile(document: TextDocument): void {
    if (this.autoClearConsole) {
      this._outputChannel.clear();
    }

    if (!this.isEnabled) {
      this.showOutputMessage();
      return;
    }

    switch (document.languageId) {
      case "go": {
        // If it's a go file, we run the wollemi build file completer.
        this.runWollemiGOFMT(document, path.dirname(document.fileName));
        return;
      }
      case "plaintext": {
        // If it's a BUILD file, we run the wollemi build file formatter.
        if (path.basename(document.fileName).includes("BUILD")) {
          this.runWollemiBUILD(document, path.dirname(document.fileName));
          return;
        }
      }
      case "plz": {
        // If it's a BUILD file, we run the wollemi build file formatter.
        this.runWollemiBUILD(document, path.dirname(document.fileName));
        return;
      }
      default: {
        this._outputChannel.appendLine(
          `vs-wollemi does not currently support ${document.languageId} files.`
        );
        return;
      }
    }
  }

  public runWollemiBUILD(doc: TextDocument, path: string): void {
    const cmd = `${this.wollemiCommand} fmt ${path}`;

    this._outputChannel.appendLine("Saved BUILD file: " + doc.fileName);
    this._runWollemiCmd(cmd, doc);
  }

  public runWollemiGOFMT(doc: TextDocument, path: string): void {
    const cmd = `${this.wollemiCommand} gofmt ${path}`;

    this._outputChannel.appendLine("Saved GO file: " + doc.fileName);
    this._runWollemiCmd(cmd, doc);
  }

  public _runWollemiCmd(cmd: string, doc: TextDocument): void {
    this.showOutputMessage(`*** cmd '${cmd}' start.`);

    var child = exec(cmd, this._getExecOption(doc));
    child.stdout.on("data", (data) => this._outputChannel.append(data));
    child.stderr.on("data", (data) => this._outputChannel.append(data));
    child.on("error", (e) => {
      this.showOutputMessage(e.message);
    });
    child.on("exit", (e) => {
      if (e != 0) {
        this.showOutputMessage(`*** cmd '${cmd}' exited with status: ${e}.`);
        return;
      }
      this.showOutputMessage(`*** cmd '${cmd}' successful.`);
    });
  }

  private _getWorkspaceFolderPath(uri: Uri): string {
    const workspaceFolder = workspace.getWorkspaceFolder(uri);

    return workspaceFolder ? workspaceFolder.uri.fsPath : "";
  }

  private _getExecOption(
    document: TextDocument
  ): { shell: string; cwd: string } {
    return {
      shell: this.shell,
      cwd: this._getWorkspaceFolderPath(document.uri),
    };
  }
}
