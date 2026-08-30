import { Uri } from "vscode";

/**
 * Result of a single file conversion operation.
 */
export interface ConvertResult {
  uri: Uri;
  encoding: string;
  confidence: number;
  changed: boolean;
  /** Set when the file could not be converted; contains the error message. */
  error?: string;
}

/**
 * Runtime context passed through the conversion pipeline.
 * This is separate from persistent settings (ConfigType).
 */
export interface ConversionContext {
  /** Whether multiple files are being processed at once */
  isBatch: boolean;
}
