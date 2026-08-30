import * as fs from "fs";
import * as iconv from "iconv-lite";

/**
 * Returns whether iconv-lite can decode from the given encoding.
 */
export function canDecode(encoding: string): boolean {
  return iconv.encodingExists(encoding);
}

/**
 * Encodings that are already UTF-8-compatible; converting them would be a no-op.
 */
const ALREADY_UTF8 = ["utf-8", "utf8", "ascii", "us-ascii"];

/**
 * Returns whether the encoding is already UTF-8 (or its ASCII subset).
 */
export function isAlreadyUtf8(encoding: string): boolean {
  return ALREADY_UTF8.includes(encoding.toLowerCase());
}

/**
 * Reads a file and decodes its content from the given encoding to a UTF-8 string.
 *
 * Uses a streaming approach via iconv-lite, which is efficient for large files.
 *
 * @param filePath - Absolute path to the file
 * @param fromEncoding - The source encoding (e.g. "GB2312", "Big5")
 * @returns Decoded UTF-8 string content
 * @throws If the file cannot be read or decoded
 */
export function convertToUtf8(filePath: string, fromEncoding: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const chunks: string[] = [];
    const stream = fs
      .createReadStream(filePath)
      .pipe(iconv.decodeStream(fromEncoding));

    stream.on("data", (chunk: string) => {
      chunks.push(chunk);
    });

    stream.on("error", (err: Error) => {
      reject(new Error(`Failed to decode file "${filePath}": ${err.message}`));
    });

    stream.on("end", () => {
      resolve(chunks.join(""));
    });
  });
}
