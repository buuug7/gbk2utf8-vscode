import * as fs from "fs/promises";
import { ExtensionContext, workspace, window, Uri } from "vscode";
import { getUserConfig } from "./config";
import { registerConvertCommand } from "./commands/convertCommand";
import { detectEncoding } from "./services/encodingDetector";
import { convertToUtf8 } from "./services/converter";
import { DETECTABLE_CHARSETS } from "./constants";
import type { ConversionContext } from "./types";
import { backupOriginal } from "./utils/backup";

export function deactivate(): void {
  // No cleanup needed
}

export function activate(context: ExtensionContext): void {
  // Register the explicit convert command (palette + context menu)
  registerConvertCommand(context);

  // Auto-detect on document open when enabled
  if (getUserConfig().autoDetect) {
    context.subscriptions.push(
      workspace.onDidOpenTextDocument(async (document) => {
        // Avoid converting files that are part of the extension itself
        if (document.uri.scheme !== "file") {
          return;
        }

        const fsPath = document.uri.fsPath;

        // Skip virtual / non-existent files (e.g. git temp files, exthost paths)
        try {
          await fs.access(fsPath);
        } catch {
          return;
        }

        const config = getUserConfig();
        const { encoding, confidence } = await detectEncoding(fsPath);

        if (!DETECTABLE_CHARSETS.includes(encoding)) {
          return;
        }

        // Check ignore lists
        const isDirIgnored = config.ignoreDir.some((dir) => fsPath.includes(dir));
        if (isDirIgnored) {
          return;
        }

        const ext = fsPath.split(".").pop() || "";
        if (config.ignoreExtensions.includes(ext)) {
          return;
        }

        // Prompt the user
        const fileName = document.uri.path.split("/").pop() || "";
        const message = `Seems the encoding of **${fileName}** is ${encoding}, do you want to convert it to UTF8?`;
        const answer = await window.showInformationMessage(message, "Yes", "No");

        if (answer === "Yes") {
          await backupOriginal(fsPath);
          const content = await convertToUtf8(fsPath, encoding);
          await workspace.fs.writeFile(document.uri, new Uint8Array(Buffer.from(content)));
        }
      })
    );
  }
}
