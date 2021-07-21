import { commands, workspace, window, ExtensionContext, Uri, ProgressLocation } from "vscode";
import * as fs from "fs";
import * as path from "path";
import * as iconv from "iconv-lite";
import * as jschardet from "jschardet";
import { ConfigType, getUserConfig } from "./config";

const extensionName = "GBK2UTF8";
let defaultConfig: ConfigType;

export function deactivate() {}

export function activate(context: ExtensionContext) {
  defaultConfig = getUserConfig();
  context.subscriptions.push(commands.registerCommand("GBK2UTF8.convert", convertWithProgress));

  if (defaultConfig.autoDetect) {
    context.subscriptions.push(
      workspace.onDidOpenTextDocument((document) => {
        replaceContent(document.uri, false).then(() => {});
      })
    );
  }
}

async function convert(clickedFile: any, selectedFiles: any, progress?: any) {
  const editor = window.activeTextEditor;
  const tasks = [];

  if (!selectedFiles && editor) {
    tasks.push(replaceContent(editor.document.uri, true));
  }

  if (selectedFiles && selectedFiles.length) {
    const firstSelected = selectedFiles[0];
    const isDirectory = fs.statSync(firstSelected.fsPath).isDirectory();
    const filePaths = [];

    if (isDirectory) {
      const iteratorFiles = (fsPath: string) => {
        const _path = path.resolve(fsPath);
        const isDir = fs.statSync(_path).isDirectory();
        if (isDir) {
          const dirs = fs.readdirSync(_path);
          for (const fileName of dirs) {
            iteratorFiles(path.resolve(_path, fileName));
          }
        } else {
          filePaths.push(fsPath);
        }
      };
      iteratorFiles(firstSelected.fsPath);
    } else {
      for (const item of selectedFiles) {
        filePaths.push(item.fsPath);
      }
    }

    for (let i = 0; i < filePaths.length; i++) {
      const item = filePaths[i];
      const uri = Uri.file(item);
      tasks.push(replaceContent(uri, true, progress));
    }

    // set config isBatch to true when have multiple files to convert
    if (filePaths.length > 1) {
      defaultConfig.isBatch = true;
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
  return detectedEncoding;
}

/**
 * change the file content to utf8
 * @param filePath the file path
 * @param encoding
 * @returns Promise<string>
 */
function reEncodingContent(filePath: string, encoding: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = fs.createReadStream(filePath).pipe(iconv.decodeStream(encoding));
    const chunks: any[] = [];
    reader.on("error", () => {
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
 * replace content
 * @param uri
 * @param force
 * @param progress
 * @returns
 */
async function replaceContent(uri: Uri, force: boolean = false, progress?: any) {
  defaultConfig = getUserConfig();
  const fsPath = uri.fsPath;
  let { encoding, confidence } = detectEncoding(fsPath);
  confidence = Number(confidence.toFixed(2));

  const notChangedReturn = {
    uri,
    encoding,
    confidence,
    change: false,
  };

  if (defaultConfig.neededConvertCharset.indexOf(encoding) === -1) {
    if (force && defaultConfig.isBatch) {
      const message = `It seems that the file encoding(${encoding}) is not GBK related.`;
      window.showWarningMessage(message);
    }
    return notChangedReturn;
  }

  let dirIsIgnored = false;

  for (let dir of defaultConfig.ignoreDir) {
    if (fsPath.indexOf(dir) !== -1) {
      dirIsIgnored = true;
      break;
    }
  }

  if (dirIsIgnored && !force) {
    return notChangedReturn;
  }

  const fileExt = fsPath.split(".").pop() || "";
  const fileName = uri.path.split("/").pop();

  if (defaultConfig.ignoreExtensions.includes(fileExt)) {
    return notChangedReturn;
  }

  const writeToFile = async () => {
    const content = await reEncodingContent(fsPath, encoding);
    await workspace.fs.writeFile(uri, Buffer.from(content));
    progress.report({ message: `${fileName}` });
    return { uri, encoding, confidence, change: true };
  };

  if (force) {
    return await writeToFile();
  }

  const message = `Seems the encoding of **${fileName}** is ${encoding}, do you want to convert it to UTF8?`;
  const answer = await window.showInformationMessage(message, "Yes", "No");

  if (answer === "Yes") {
    return await writeToFile();
  } else {
    return notChangedReturn;
  }
}

function convertWithProgress(clickedFile: any, selectedFiles: any) {
  const options = {
    location: ProgressLocation.Notification,
    cancellable: true,
    title: "Convert",
  };
  window.withProgress(options, async (progress) => {
    progress.report({ message: "start convert..." });
    const result = await convert(clickedFile, selectedFiles, progress);
    if (defaultConfig.showBatchReport && defaultConfig.isBatch) {
      await writeLogFile(result);
    }
  });
}

type LogItem = {
  uri: Uri;
  encoding: string;
  confidence: number;
  change: boolean;
};

async function writeLogFile(result: LogItem[]) {
  if (workspace.workspaceFolders) {
    const convertedList = result.filter((it) => it.change);
    const notConvertList = result.filter((it) => !it.change);

    let writeContent = `# Process result (${result.length})\n`;
    writeContent += `\n> item format: [encoding/confidence][file path]\n`;
    writeContent += `\n## Converted (${convertedList.length})\n\n`;

    const template = (item: LogItem) => `- \`[${item.encoding}/${item.confidence}]\` \`${item.uri.fsPath}\`\n`;

    convertedList.forEach((item) => {
      writeContent += template(item);
    });

    writeContent += `\n## Not convert (${notConvertList.length})\n\n`;

    notConvertList.forEach((item) => {
      writeContent += template(item);
    });

    const rootFolder = workspace.workspaceFolders[0];
    const fileName = `${extensionName}-result-${Math.floor(Math.random() * 100000)}.md`;
    const filePath = rootFolder.uri.fsPath + `/${fileName}`;
    fs.writeFileSync(filePath, writeContent);

    const doc = await workspace.openTextDocument(filePath);
    await window.showTextDocument(doc);
  }
}
