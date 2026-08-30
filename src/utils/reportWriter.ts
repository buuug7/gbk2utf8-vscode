import * as fs from "fs/promises";
import * as path from "path";
import { commands, workspace, Uri } from "vscode";
import type { ConvertResult } from "../types";
import { EXTENSION_NAME } from "../constants";

/**
 * Generates a markdown conversion report and opens it in the editor.
 *
 * @param results - The conversion results to report
 * @param rootUri - The workspace folder URI to write the report into
 */
export async function writeReport(results: ConvertResult[], rootUri: Uri): Promise<void> {
  if (results.length === 0) {
    return;
  }

  const converted = results.filter((r) => r.changed);
  const failed = results.filter((r) => r.error);
  const notConverted = results.filter((r) => !r.changed && !r.error);

  const reportDir = rootUri.fsPath;
  const content = buildReportContent(results, converted, notConverted, failed, reportDir);

  const timestamp = formatTimestamp(new Date());
  const fileName = `${EXTENSION_NAME}-result-${timestamp.replace(/:/g, "-")}.md`;
  const filePath = path.join(reportDir, fileName);

  try {
    await fs.writeFile(filePath, content, "utf-8");
    const doc = await workspace.openTextDocument(filePath);
    // Open the report in the Markdown preview so file links are clickable.
    await commands.executeCommand("markdown.showPreviewToSide", doc.uri);
  } catch (err) {
    console.error(`Failed to write report file "${filePath}":`, err);
  }
}

/**
 * Builds the full Markdown report content.
 */
function buildReportContent(
  results: ConvertResult[],
  converted: ConvertResult[],
  notConverted: ConvertResult[],
  failed: ConvertResult[],
  reportDir: string
): string {
  const lines: string[] = [];
  const total = results.length;
  const successRate = total > 0 ? ((converted.length / total) * 100).toFixed(1) : "0.0";

  // Header
  lines.push(`# Conversion Report`);
  lines.push("");
  lines.push(`> Generated at ${formatTimestamp(new Date())}`);
  lines.push("");

  // Summary
  lines.push("## Summary");
  lines.push("");
  lines.push(`| Metric | Value |`);
  lines.push(`| ------ | ----- |`);
  lines.push(`| Total files | ${total} |`);
  lines.push(`| Converted | ${converted.length} |`);
  lines.push(`| Skipped | ${notConverted.length} |`);
  lines.push(`| Failed | ${failed.length} |`);
  lines.push(`| Success rate | ${successRate}% |`);
  lines.push("");

  // Encoding distribution
  const encodingCounts = countByEncoding(converted);
  if (encodingCounts.length > 0) {
    lines.push("## Encoding Distribution");
    lines.push("");
    lines.push(`| Encoding | Count |`);
    lines.push(`| -------- | ----- |`);
    for (const { encoding, count } of encodingCounts) {
      lines.push(`| \`${encoding}\` | ${count} |`);
    }
    lines.push("");
  }

  // Converted files
  if (converted.length > 0) {
    lines.push("## Converted Files");
    lines.push("");
    for (const item of converted) {
      lines.push(formatFileLine(item, reportDir));
    }
    lines.push("");
  }

  // Failed files
  if (failed.length > 0) {
    lines.push("## Failed Files");
    lines.push("");
    for (const item of failed) {
      lines.push(`- ${relativePathLink(item.uri.fsPath, reportDir)} — ${item.error}`);
    }
    lines.push("");
  }

  // Skipped files
  if (notConverted.length > 0) {
    lines.push("## Skipped Files");
    lines.push("");
    for (const item of notConverted) {
      lines.push(formatFileLine(item, reportDir));
    }
    lines.push("");
  }

  return lines.join("\n");
}

/**
 * Formats a date as a local-time `yyyy-mm-dd HH:mm:ss` string.
 */
function formatTimestamp(date: Date): string {
  const pad = (n: number): string => String(n).padStart(2, "0");
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  return `${date.getFullYear()}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * Formats a single result as a markdown list item, linking the file.
 */
function formatFileLine(item: ConvertResult, reportDir: string): string {
  return `- \`[${item.encoding}/${item.confidence}]\` ${relativePathLink(item.uri.fsPath, reportDir)}`;
}

/**
 * Builds a markdown link to `fsPath`, relative to the report directory so it
 * opens the file when clicked in the report's markdown preview.
 */
function relativePathLink(fsPath: string, reportDir: string): string {
  const rel = path.relative(reportDir, fsPath).replace(/\\/g, "/");
  return `[${rel}](${encodeURI(rel)})`;
}

/**
 * Counts results grouped by encoding, sorted by count descending.
 */
function countByEncoding(results: ConvertResult[]): { encoding: string; count: number }[] {
  const map = new Map<string, number>();
  for (const r of results) {
    map.set(r.encoding, (map.get(r.encoding) || 0) + 1);
  }
  return Array.from(map.entries())
    .map(([encoding, count]) => ({ encoding, count }))
    .sort((a, b) => b.count - a.count);
}
