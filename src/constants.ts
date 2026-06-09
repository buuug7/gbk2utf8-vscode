/**
 * Extension identifier used throughout the codebase.
 */
export const EXTENSION_NAME = "GBK2UTF8";

/**
 * Charsets that are detected and converted from (Chinese-related encodings).
 */
export const DETECTABLE_CHARSETS: string[] = [
  "Big5",
  "GB2312",
  "GB18030",
  "EUC-TW",
  "HZ-GB-2312",
  "ISO-2022-CN",
];

/**
 * Default ignore file extensions (comma-separated string matching the config default).
 */
export const DEFAULT_IGNORE_EXTENSIONS = "git,ts,vue";

/**
 * Default ignore directories (comma-separated string matching the config default).
 */
export const DEFAULT_IGNORE_DIRS = "node_modules,.vscode,.idea,.vscode-test,.github";

/**
 * Number of bytes to sample for encoding detection.
 */
export const DETECTION_SAMPLE_SIZE = 512;

/**
 * Maximum progress bar message length.
 */
export const MAX_PROGRESS_MESSAGE_LENGTH = 50;
