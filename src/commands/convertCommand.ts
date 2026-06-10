import * as fs from "fs/promises";
import {
  commands,
  ExtensionContext,
  ProgressLocation,
  window,
  workspace,
  Uri,
} from "vscode";
import { getUserConfig, ConfigType } from "../config";
import { collectFiles } from "../services/fileCollector";
import { detectEncoding } from "../services/encodingDetector";
import { convertToUtf8 } from "../services/converter";
import { writeReport } from "../utils/reportWriter";
import { backupOriginal } from "../utils/backup";
import { DETECTABLE_CHARSETS } from "../constants";
import type { ConvertResult, ConversionContext } from "../types";

/**
 * Registers the "GBK2UTF8.convert" command with VS Code.
 */
export function registerConvertCommand(context: ExtensionContext): void {
  const disposable = commands.registerCommand(
    "GBK2UTF8.convert",
    convertWithProgress
  );
  context.subscriptions.push(disposable);
}

/**
 * Entry point for the convert command — wraps the conversion in a progress dialog.
 */
async function convertWithProgress(
  clickedFile: any, // eslint-disable-line @typescript-eslint/no-explicit-any
  selectedFiles: any[] // eslint-disable-line @typescript-eslint/no-explicit-any
): Promise<void> {
  const config = getUserConfig();

  await window.withProgress(
    {
      location: ProgressLocation.Notification,
      // cancellable: true,
      title: "Convert",
    },
    async (progress) => {
      progress.report({ message: "collecting files..." });

      const { files, context } = await collectFiles(
        clickedFile,
        selectedFiles,
        config
      );

      if (files.length === 0) {
        return;
      }

      const results: ConvertResult[] = [];

      for (let i = 0; i < files.length; i++) {
        const uri = files[i];

        progress.report({
          message: `processing ${getFileName(uri)}`,
          increment: Math.round((1 / files.length) * 100),
        });

        const result = await processFile(uri, config, context);
        results.push(result);
      }

      progress.report({ message: "done" });

      if (config.showBatchReport && context.isBatch) {
        const rootFolder = workspace.workspaceFolders?.[0]?.uri;
        if (rootFolder) {
          await writeReport(results, rootFolder);
        }
      }
    }
  );
}

/**
 * Processes a single file: detect encoding, optionally prompt user, convert if needed.
 */
async function processFile(
  uri: Uri,
  config: ConfigType,
  ctx: ConversionContext
): Promise<ConvertResult> {
  const fsPath = uri.fsPath;

  // Skip virtual / non-existent files
  try {
    await fs.access(fsPath);
  } catch {
    return { uri, encoding: "unknown", confidence: 0, changed: false };
  }

  let { encoding, confidence } = await detectEncoding(fsPath);

  // Skip files whose encoding is not in the detectable charset list
  if (!DETECTABLE_CHARSETS.includes(encoding)) {
    if (!ctx.isBatch) {
      const message = `It seems that the file encoding(${encoding}) is not GBK related.`;
      window.showWarningMessage(message);
    }
    return { uri, encoding, confidence, changed: false };
  }

  if (ctx.isBatch) {
    // Batch mode: backup then convert silently
    const content = await convertToUtf8(fsPath, encoding);
    await backupOriginal(fsPath);
    await workspace.fs.writeFile(uri, new Uint8Array(Buffer.from(content)));
    return { uri, encoding, confidence, changed: true };
  }

  // Single file mode: prompt the user
  const fileName = getFileName(uri);
  const message = `Seems the encoding of **${fileName}** is ${encoding}, do you want to convert it to UTF8?`;
  const answer = await window.showInformationMessage(message, "Yes", "No");

  if (answer === "Yes") {
    const content = await convertToUtf8(fsPath, encoding);
    await backupOriginal(fsPath);
    await workspace.fs.writeFile(uri, new Uint8Array(Buffer.from(content)));
    return { uri, encoding, confidence, changed: true };
  }

  return { uri, encoding, confidence, changed: false };
}

/**
 * Extracts the file name from a URI path.
 */
function getFileName(uri: Uri): string {
  return uri.path.split("/").pop() || "";
}
