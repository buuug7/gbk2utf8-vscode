import * as fs from "fs/promises";
import * as jschardet from "jschardet";
import { DETECTION_SAMPLE_SIZE } from "../constants";

/**
 * Result of encoding detection.
 */
export interface EncodingInfo {
  encoding: string;
  confidence: number;
}

/**
 * Detects the encoding of a file by reading the first N bytes and
 * passing them through jschardet's heuristic analysis.
 *
 * @param filePath - Absolute path to the file
 * @returns Detected encoding info with confidence score
 */
export async function detectEncoding(filePath: string): Promise<EncodingInfo> {
  const handle = await fs.open(filePath, "r");
  try {
    const buffer = Buffer.alloc(DETECTION_SAMPLE_SIZE);
    const { bytesRead } = await handle.read(buffer, 0, DETECTION_SAMPLE_SIZE, null);
    const sample = bytesRead < DETECTION_SAMPLE_SIZE ? buffer.subarray(0, bytesRead) : buffer;
    const detected = jschardet.detect(sample);
    return {
      encoding: detected.encoding,
      confidence: Number(detected.confidence.toFixed(2)),
    };
  } finally {
    await handle.close();
  }
}
