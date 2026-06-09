import * as fs from "fs";
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
  const converted = results.filter((r) => r.changed);
  const notConverted = results.filter((r) => !r.changed);

  const template = (item: ConvertResult): string =>
    `- \`[${item.encoding}/${item.confidence}]\` \`${item.uri.fsPath}\`\n`;

  let content = `# Process result (${results.length})\n`;
  content += `\n> item format: [encoding/confidence][file path]\n`;
  content += `\n## Converted (${converted.length})\n\n`;
  converted.forEach((item) => (content += template(item)));
  content += `\n## Not convert (${notConverted.length})\n\n`;
  notConverted.forEach((item) => (content += template(item)));

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const fileName = `${EXTENSION_NAME}-result-${timestamp}.md`;
  const filePath = `${rootUri.fsPath}/${fileName}`;

  fs.writeFileSync(filePath, content, "utf-8");

  const doc = await workspace.openTextDocument(filePath);
  await window.showTextDocument(doc);
}
