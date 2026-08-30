import * as fs from "fs/promises";
import * as jschardet from "jschardet";
import { TextDecoder } from "util";
import { DETECTION_SAMPLE_SIZE, DETECTION_TAIL_SAMPLE_SIZE } from "../constants";

/**
 * jschardet reports these languages for multi-byte CJK encodings, which we
 * trust instead of second-guessing (see classify).
 */
const CJK_LANGUAGES = ["zh", "ja", "ko"];

/**
 * Result of encoding detection.
 */
export interface EncodingInfo {
  encoding: string;
  confidence: number;
}

/**
 * Detects the encoding of a file by sampling the head (and, for larger files,
 * the tail) and classifying the sample deterministically where possible.
 *
 * Only a bounded prefix/suffix is read, so memory usage stays flat regardless
 * of file size.
 */
export async function detectEncoding(filePath: string): Promise<EncodingInfo> {
  const handle = await fs.open(filePath, "r");
  try {
    const { size } = await handle.stat();
    const head = await readRange(handle, 0, DETECTION_SAMPLE_SIZE);

    let sample = head;
    const tailSize = Math.min(DETECTION_TAIL_SAMPLE_SIZE, size - DETECTION_SAMPLE_SIZE);
    if (tailSize > 0) {
      const tail = await readRange(handle, size - tailSize, tailSize);
      sample = Buffer.concat([sample, tail]);
    }

    return classify(sample);
  } finally {
    await handle.close();
  }
}

/**
 * Classifies a sample into an encoding. This service answers "what encoding is
 * this file", and any detected encoding can later be converted to UTF-8, so
 * there is no target-charset whitelist.
 *
 * UTF-8 is recognized deterministically. For everything else the heuristic
 * jschardet model is used; it is also the only way to pick between overlapping
 * multi-byte CJK encodings (GB18030 and Big5 accept each other's byte streams,
 * so a strict decode alone cannot tell them apart). One known failure mode is
 * an ASCII-dominant GBK file that jschardet reads as a random latin encoding
 * with a bogus language hint — when that happens, bytes that strictly decode
 * as GB18030 are honoured instead.
 */
function classify(sample: Buffer): EncodingInfo {
  const bytes = new Uint8Array(sample);

  // Files that decode cleanly as UTF-8 need no conversion.
  if (decodesStrict("utf-8", bytes)) {
    return { encoding: "utf-8", confidence: 1 };
  }

  const detected = jschardet.detect(bytes);
  const primary = detected.encoding;

  // Enough of the file is non-ASCII and GB18030 decodes it strictly, but
  // jschardet did not land on a confident CJK-language verdict (it guessed a
  // single-byte latin/ascii encoding instead) — trust the bytes over the guess.
  const skippedCjkGuess = !primary || (detected.language ? !CJK_LANGUAGES.includes(detected.language) : true);
  if (skippedCjkGuess && detected.confidence < 0.35 && hasNonAscii(sample) && decodesStrict("gb18030", bytes)) {
    return {
      encoding: "GB18030",
      confidence: Number(detected.confidence.toFixed(2)),
    };
  }

  return {
    encoding: primary ?? "unknown",
    confidence: Number(detected.confidence.toFixed(2)),
  };
}

/**
 * Returns true if the buffer decodes without error under the given label with
 * fatal error handling (any invalid byte sequence throws).
 */
function decodesStrict(label: string, bytes: Uint8Array): boolean {
  try {
    new TextDecoder(label, { fatal: true }).decode(bytes);
    return true;
  } catch {
    return false;
  }
}

function hasNonAscii(buffer: Buffer): boolean {
  for (const byte of buffer) {
    if (byte >= 0x80) {
      return true;
    }
  }
  return false;
}

/**
 * Reads up to `length` bytes starting at `position`, returning a buffer
 * truncated to the actual number of bytes read (handles short reads / EOF).
 */
async function readRange(handle: fs.FileHandle, position: number, length: number): Promise<Buffer> {
  const buffer = Buffer.alloc(length);
  const { bytesRead } = await handle.read(buffer, 0, length, position);
  return bytesRead < length ? buffer.subarray(0, bytesRead) : buffer;
}
