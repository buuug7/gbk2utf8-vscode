import * as fs from "fs/promises";
import * as path from "path";

/**
 * Creates a backup of the original file before conversion.
 * The backup is saved in the same directory as the source file,
 * with a `.bak.`.
 *
 * Example: `test-gb2312.txt` → `test-gb2312.txt.bak`
 *
 * @param filePath - Absolute path to the file to back up
 * @returns The backup file path, or null if backup failed
 */
export async function backupOriginal(filePath: string): Promise<string | null> {
  try {
    const dir = path.dirname(filePath);
    const baseName = path.basename(filePath);

    const backupPath = path.join(dir, `${baseName}.bak`);

    await fs.copyFile(filePath, backupPath);
    return backupPath;
  } catch (err) {
    console.error(`Failed to back up file "${filePath}":`, err);
    return null;
  }
}
