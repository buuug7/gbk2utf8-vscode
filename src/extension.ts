// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as fs from "fs";
import * as iconv from "iconv-lite";

function changeFileEncode() {
  const editor = vscode.window.activeTextEditor;

  if (editor) {
    const document = editor.document;
    const text = document.getText();

    if (text.indexOf("�") !== -1) {
      const filePath = document.uri.fsPath;
      const filePathArr = filePath.split("\\");
      const fileName = `${filePathArr.pop()?.split(".")[0]}_utf8.txt`;
      const newFileName = filePathArr.join("\\") + "\\" + fileName;

      fs.createReadStream(filePath)
        .pipe(iconv.decodeStream("gbk"))
        .pipe(iconv.encodeStream("utf-8"))
        .pipe(fs.createWriteStream(newFileName));

      vscode.window.showInformationMessage(
        `convert encode to utf8 and saved to ${fileName}`
      );
    }
  }
}

export function activate(context: vscode.ExtensionContext) {
  const disposableTwice = vscode.commands.registerCommand(
    "GBK_TO_UTF8.generate",
    () => {
      changeFileEncode();
    }
  );

  context.subscriptions.push(disposableTwice);
}
export function deactivate() {}
