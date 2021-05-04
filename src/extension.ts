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

// auto detect file encoding with gbk
let autoDetect = false;
// ignore the specified file extensions, separated by comma
let ignoreFileExtensions: string[] = [];

export function activate(context: ExtensionContext) {
  const config = workspace.getConfiguration("GBK2UTF8");
  autoDetect = config.get<boolean>("autoDetect") as boolean;
  const _ignoreExt = config.get<string>("ignoreFileExtensions");
  ignoreFileExtensions = _ignoreExt ? _ignoreExt.split(",") : [];

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
 * determine the text is gbk encode
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
      .pipe(iconv.decodeStream("gbk")); // default to utf8
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
 * replace the editor content with new encode content
 * @param document
 * @param force
 * @returns
 */
async function replaceEditorContent(
  document: TextDocument,
  force: boolean = false
) {
  console.log("autoConvert...");
  const text = document.getText();
  const fileName = document.fileName;

  if (!isGBK(text)) {
    return;
  }

  const fileExt = fileName.split(",").pop() || "";
  if (ignoreFileExtensions.includes(fileExt)) {
    return;
  }

  const message = `It seems that the encoding of **${fileName}** file is GBK, do you want to convert it to utf8?`;
  const yes = "Yes";
  const no = "No";

  const doReplaceWork = async () => {
    const fsPath = document.uri.fsPath;
    const content = await changeEncode(fsPath);
    const editor = window.activeTextEditor;
    const startPosition = new Position(0, 0);
    const endPosition = new Position(document.lineCount, 0);
    const range = new Range(startPosition, endPosition);
    editor?.edit((builder) => {
      builder.replace(range, content);
      window.showInformationMessage("Successfully converted encode to UTF8");
    });
  };

  if (force) {
    await doReplaceWork();
    return;
  }

  window.showInformationMessage(message, yes, no).then((value) => {
    if (value === yes) {
      doReplaceWork();
    }
  });
}
