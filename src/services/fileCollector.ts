import * as fs from "fs/promises";
import * as path from "path";
import { Uri, window } from "vscode";
import type { ConfigType } from "../config";
import { ConversionContext } from "../types";

/**
 * Result of file collection.
 */
export interface CollectedFiles {
  files: Uri[];
  context: ConversionContext;
}

/**
 * Collects files to process based on the user's selection.
 *
 * - No selection but active editor → convert the current file
 * - Single file selected → convert that file
 * - Multiple files selected → batch convert them
 * - Directory selected → recursively walk it and convert all matching files
 *
 * @param clickedFile - The file/folder that was right-clicked (if any)
 * @param selectedFiles - The full selection from the explorer context menu
 * @param config - Current user configuration
 * @returns Collected file URIs and batch context
 */
export async function collectFiles(
  clickedFile: any, // eslint-disable-line @typescript-eslint/no-explicit-any
  selectedFiles: any[], // eslint-disable-line @typescript-eslint/no-explicit-any
  config: ConfigType
): Promise<CollectedFiles> {
  const editor = window.activeTextEditor;
  const collected: Uri[] = [];

  // Single file via editor (command palette, no selection)
  if (!selectedFiles && editor) {
    collected.push(editor.document.uri);
    return { files: collected, context: { isBatch: false } };
  }

  // No selection at all
  if (!selectedFiles || selectedFiles.length === 0) {
    return { files: collected, context: { isBatch: false } };
  }

  const firstSelected = selectedFiles[0];
  const stat = await fs.stat(firstSelected.fsPath);

  if (stat.isDirectory()) {
    // Walk directory recursively
    await walkDirectory(firstSelected.fsPath, config, collected);
  } else {
    // Multiple files selected
    for (const item of selectedFiles) {
      collected.push(item);
    }
  }

  return {
    files: collected,
    context: { isBatch: collected.length > 1 },
  };
}

/**
 * Recursively walks a directory and collects files that are not ignored.
 */
async function walkDirectory(
  dirPath: string,
  config: ConfigType,
  result: Uri[]
): Promise<void> {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.resolve(dirPath, entry.name);

    if (entry.isDirectory()) {
      if (isDirIgnored(entry.name, config.ignoreDir)) {
        continue;
      }
      await walkDirectory(fullPath, config, result);
    } else if (entry.isFile()) {
      if (!isExtensionIgnored(entry.name, config.ignoreExtensions)) {
        result.push(Uri.file(fullPath));
      }
    }
  }
}

/**
 * Checks if a directory name matches any of the ignored directory patterns.
 */
function isDirIgnored(dirName: string, ignoreDirs: string[]): boolean {
  return ignoreDirs.some((ignored) => dirName === ignored);
}

/**
 * Checks if a file extension matches any of the ignored extension patterns.
 */
function isExtensionIgnored(fileName: string, ignoreExtensions: string[]): boolean {
  const ext = fileName.split(".").pop() || "";
  return ignoreExtensions.includes(ext);
}
