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

export function activate(context: ExtensionContext) {
  const convertCommand = commands.registerCommand("GBK_TO_UTF8.convert", () => {
    const editor = window.activeTextEditor;

    if (editor) {
      const document = editor.document;
      replaceEditorContent(document, true);
    }
  });
  context.subscriptions.push(convertCommand);

  const suggestConvert = workspace.onDidOpenTextDocument((document) => {
    replaceEditorContent(document, false);
  });
  context.subscriptions.push(suggestConvert);
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
      console.log("buffer:", buffer);

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

  if (!isGBK(text)) {
    return;
  }

  const message =
    "It seems that the encode of file is GBK, do you want to convert the encoding to utf8?";
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
    doReplaceWork();
  } else {
    window.showInformationMessage(message, yes, no).then((value) => {
      if (value === yes) {
        doReplaceWork();
      }
    });
  }
}
