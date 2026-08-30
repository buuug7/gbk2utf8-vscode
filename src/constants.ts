/**
 * Extension identifier used throughout the codebase.
 */
export const EXTENSION_NAME = "GBK2UTF8";

/**
 * Default ignore file extensions (comma-separated string matching the config default).
 */
export const DEFAULT_IGNORE_EXTENSIONS =
  "git,bak,zip,rar,7z,gz,tar,jpg,jpeg,png,gif,bmp,ico,webp,mp3,mp4,avi,mkv,wav,flac,exe,dll,so,pdf,doc,docx,xls,xlsx,ppt,pptx,ttf,otf,sqlite";

/**
 * Default ignore directories (comma-separated string matching the config default).
 */
export const DEFAULT_IGNORE_DIRS = "node_modules,.vscode,.idea,.vscode-test,.github";

/**
 * Number of bytes to sample from the head of a file for encoding detection.
 */
export const DETECTION_SAMPLE_SIZE = 64 * 1024;

/**
 * Number of bytes additionally sampled from the tail of large files, so that
 * encoding markers appearing later in the file are not missed.
 */
export const DETECTION_TAIL_SAMPLE_SIZE = 64 * 1024;

/**
 * Maximum progress bar message length.
 */
export const MAX_PROGRESS_MESSAGE_LENGTH = 50;
