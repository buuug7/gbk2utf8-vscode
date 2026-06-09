import * as fs from "fs/promises";
import * as path from "path";
import { workspace, window, Uri } from "vscode";
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
  const notConverted = results.filter((r) => !r.changed);

  const content = buildReportContent(results, converted, notConverted);

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const fileName = `${EXTENSION_NAME}-result-${timestamp}.md`;
  const filePath = path.join(rootUri.fsPath, fileName);

  try {
    await fs.writeFile(filePath, content, "utf-8");
    const doc = await workspace.openTextDocument(filePath);
    await window.showTextDocument(doc);
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
  notConverted: ConvertResult[]
): string {
  const lines: string[] = [];
  const total = results.length;
  const successRate = total > 0 ? ((converted.length / total) * 100).toFixed(1) : "0.0";

  // Header
  lines.push(`# Conversion Report`);
  lines.push("");
  lines.push(`> Generated at ${new Date().toLocaleString()}`);
  lines.push("");

  // Summary
  lines.push("## Summary");
  lines.push("");
  lines.push(`| Metric | Value |`);
  lines.push(`| ------ | ----- |`);
  lines.push(`| Total files | ${total} |`);
  lines.push(`| Converted | ${converted.length} |`);
  lines.push(`| Skipped | ${notConverted.length} |`);
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
      lines.push(formatFileLine(item));
    }
    lines.push("");
  }

  // Skipped files
  if (notConverted.length > 0) {
    lines.push("## Skipped Files");
    lines.push("");
    for (const item of notConverted) {
      lines.push(formatFileLine(item));
    }
    lines.push("");
  }

  return lines.join("\n");
}

/**
 * Formats a single result as a markdown list item.
 */
function formatFileLine(item: ConvertResult): string {
  const fileName = item.uri.path.split("/").pop() || item.uri.fsPath;
  return `- \`[${item.encoding}/${item.confidence}]\` ${fileName} — \`${item.uri.fsPath}\``;
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
