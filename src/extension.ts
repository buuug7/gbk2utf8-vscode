import {
  commands,
  workspace,
  window,
  Position,
  Range,
  TextDocument,
  ExtensionContext,
} from "vscode";
import * as fs from "fs";
import * as iconv from "iconv-lite";

// Auto detect file encoding with GBK related.
let autoDetect = false;

// Ignore the specified file extensions, separated by comma.
let ignoreExtensions: string[] = [];

// Ignore the specified directory, separated by comma.
let ignoreDir: string[] = [];

export function activate(context: ExtensionContext) {
  const config = workspace.getConfiguration("GBK2UTF8");
  autoDetect = config.get<boolean>("autoDetect") as boolean;
  const _ignoreExt = config.get<string>("ignoreExtensions");
  ignoreExtensions = _ignoreExt ? _ignoreExt.split(",") : [];
  const _ignoreDir = config.get<string>("ignoreDir");
  ignoreDir = _ignoreDir ? _ignoreDir.split(",") : [];

  context.subscriptions.push(
    commands.registerCommand("GBK2UTF8.convert", () => {
      const editor = window.activeTextEditor;

      if (editor) {
        const document = editor.document;
        replaceEditorContent(document, true);
      }
    })
  );

  if (autoDetect) {
    context.subscriptions.push(
      workspace.onDidOpenTextDocument((document) => {
        replaceEditorContent(document, false).then((r) => {});
      })
    );
  }
}

export function deactivate() {}

/**
 * determine the text is gbk encoding
 * @param text
 * @returns
 */
function isGBK(text: string) {
  return text.indexOf("�") !== -1;
}

/**
 * change the file content to utf8
 * @param filePath the file path
 * @returns Promise<string>
 */
function changeEncode(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = fs
      .createReadStream(filePath)
      .pipe(iconv.decodeStream("GB18030")); // decode from GB18030 to utf8(default)
    const chunks: any[] = [];
    reader.on("error", (error) => {
      reject("oops, something went wrong!");
    });
    reader.on("data", (buffer) => {
      chunks.push(buffer);
    });
    reader.on("end", () => {
      const content = chunks.join("");
      resolve(content);
    });
  });
}

/**
 * replace the editor content with new encoding content
 * @param document
 * @param force
 * @returns
 */
async function replaceEditorContent(
  document: TextDocument,
  force: boolean = false
) {
  const text = document.getText();
  const fileName = document.fileName;

  if (!isGBK(text)) {
    if (force) {
      window.showWarningMessage(
        "It seems that the file encoding is not GBK related."
      );
    }
    return;
  }

  let dirIsIgnored = false;
  for (let dir of ignoreDir) {
    if (fileName.indexOf(dir) !== -1) {
      dirIsIgnored = true;
      break;
    }
  }
  if (dirIsIgnored && !force) {
    return;
  }

  const fileExt = fileName.split(".").pop() || "";
  if (ignoreExtensions.includes(fileExt)) {
    return;
  }
  const message = `It seems that the encoding of **${fileName}** file is GBK, do you want to convert it to UTF8?`;
  const doReplaceWork = async () => {
    const fsPath = document.uri.fsPath;
    const content = await changeEncode(fsPath);

    const editor = window.activeTextEditor;
    const startPosition = new Position(0, 0);
    const endPosition = new Position(document.lineCount, 0);
    const range = new Range(startPosition, endPosition);
    editor?.edit((builder) => {
      builder.replace(range, content);
      window.showInformationMessage("Successfully converted encoding to UTF8");
    });
  };

  if (force) {
    await doReplaceWork();
    return;
  }

  window.showInformationMessage(message, "Yes", "No").then((value) => {
    if (value === "Yes") {
      doReplaceWork();
    }
  });
}
