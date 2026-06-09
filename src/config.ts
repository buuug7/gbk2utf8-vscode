import { workspace } from "vscode";
import {
  DEFAULT_IGNORE_EXTENSIONS,
  DEFAULT_IGNORE_DIRS,
} from "./constants";

/**
 * User-configurable settings for the extension.
 */
export type ConfigType = {
  /** Auto detect file encoding on open */
  autoDetect: boolean;
  /** Comma-separated file extensions to ignore */
  ignoreExtensions: string[];
  /** Comma-separated directory names to ignore */
  ignoreDir: string[];
  /** Show report after batch conversion */
  showBatchReport: boolean;
  /** Chinese-related encodings that should be converted */
  neededConvertCharset: string[];
};

/**
 * Splits a comma-separated config string into a trimmed array.
 * Handles "git,ts,vue" → ["git", "ts", "vue"] and " git , ts " → ["git", "ts"].
 */
function splitAndTrim(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Loads the user's extension configuration from VS Code settings.
 */
export function getUserConfig(): ConfigType {
  const config = workspace.getConfiguration("GBK2UTF8");

  return {
    autoDetect: config.get<boolean>("autoDetect", true),

    ignoreExtensions: splitAndTrim(
      config.get<string>("ignoreExtensions", DEFAULT_IGNORE_EXTENSIONS)
    ),

    ignoreDir: splitAndTrim(
      config.get<string>("ignoreDir", DEFAULT_IGNORE_DIRS)
    ),

    showBatchReport: config.get<boolean>("showBatchReport", true),

    // Traditional and Simplified Chinese encodings that trigger conversion
    neededConvertCharset: [
      "Big5",
      "GB2312",
      "GB18030",
      "EUC-TW",
      "HZ-GB-2312",
      "ISO-2022-CN",
    ],
  };
}
