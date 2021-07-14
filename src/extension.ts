import { commands, workspace, window, ExtensionContext, Uri } from "vscode";
import * as fs from "fs";
import * as iconv from "iconv-lite";
import * as jschardet from "jschardet";
import { config, getUserConfig } from "./config";

let defaultConfig = config;

export function deactivate() {}

export function activate(context: ExtensionContext) {
  defaultConfig = { ...defaultConfig, ...getUserConfig() };

  context.subscriptions.push(
    commands.registerCommand("GBK2UTF8.convert", convert)
  );

  if (defaultConfig.autoDetect) {
    context.subscriptions.push(
      workspace.onDidOpenTextDocument((document) => {
        replaceContent(document.uri, false).then((r) => {});
      })
    );
  }
}

async function convert(clickedFile: any, selectedFiles: any) {
  const editor = window.activeTextEditor;
  const tasks = [];

  if (!selectedFiles && editor) {
    tasks.push(replaceContent(editor.document.uri, true));
  }

  if (selectedFiles && selectedFiles.length) {
    let fileList = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      const item = selectedFiles[i];
      const uri = Uri.file(item.fsPath);
      tasks.push(replaceContent(uri, true));
      fileList.push(item.fsPath);
    }

    // show result file
    if (workspace.workspaceFolders) {
      let writeContent = `Process File List(${selectedFiles.length}): \n\n`;
      writeContent += fileList.join("\n");

      const rootFolder = workspace.workspaceFolders[0];
      const fileName = `result-${Math.floor(Math.random() * 100000)}.txt`;
      const filePath = rootFolder.uri.fsPath + `/${fileName}`;
      fs.writeFileSync(filePath, writeContent);

      const doc = await workspace.openTextDocument(filePath);
      await window.showTextDocument(doc);
    }
  }

  return Promise.all(tasks);
}

/**
 * detect file encoding
 * @param fsPath
 */
function detectEncoding(fsPath: string) {
  const sampleSize = 512;
  const sample = Buffer.alloc(sampleSize);
  const fd = fs.openSync(fsPath, "r");

  fs.readSync(fd, sample, 0, sampleSize, null);
  fs.closeSync(fd);
  const detectedEncoding = jschardet.detect(sample);
  // console.log(detectedEncoding);
  return detectedEncoding;
}

/**
 * change the file content to utf8
 * @param filePath the file path
 * @returns Promise<string>
 */
function reEncodingContent(
  filePath: string,
  encoding: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = fs
      .createReadStream(filePath)
      .pipe(iconv.decodeStream(encoding));
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
async function replaceContent(uri: Uri, force: boolean = false) {
  const fsPath = uri.fsPath;
  const { encoding } = detectEncoding(fsPath);

  if (config.neededConvertCharset.indexOf(encoding) === -1) {
    if (force) {
      const message = `It seems that the file encoding(${encoding}) is not GBK related.`;
      window.showWarningMessage(message);
    }
    return;
  }

  let dirIsIgnored = false;
  for (let dir of defaultConfig.ignoreDir) {
    if (fsPath.indexOf(dir) !== -1) {
      dirIsIgnored = true;
      break;
    }
  }
  if (dirIsIgnored && !force) {
    return;
  }

  const fileExt = fsPath.split(".").pop() || "";
  const fileName = uri.path.split("/").pop();

  if (defaultConfig.ignoreExtensions.includes(fileExt)) {
    return;
  }
  const message = `It seems that the encoding of **${fileName}** is ${encoding}, do you want to convert it to UTF8?`;
  const replaceContent = async () => {
    const content = await reEncodingContent(fsPath, encoding);

    // const lineCount = content.split("\n").length;
    // const doc = await workspace.openTextDocument(uri);
    // const editor = await window.showTextDocument(doc);
    // editor.edit((text) => {
    //   text.replace(new Range(0, 0, lineCount, 0), content);
    // });

    // fs.writeFileSync(fsPath, content);
    await workspace.fs.writeFile(uri, Buffer.from(content));
  };

  if (force) {
    await replaceContent();
    return;
  }

  window.showInformationMessage(message, "Yes", "No").then((value) => {
    if (value === "Yes") {
      replaceContent();
    }
  });
}
