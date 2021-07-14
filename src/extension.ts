import {
  commands,
  workspace,
  window,
  ExtensionContext,
  Uri,
  ProgressLocation,
} from "vscode";
import * as fs from "fs";
import * as iconv from "iconv-lite";
import * as jschardet from "jschardet";
import { config, getUserConfig } from "./config";

const extensionName = "GBK2UTF8";
let defaultConfig = config;

export function deactivate() {}

export function activate(context: ExtensionContext) {
  defaultConfig = { ...defaultConfig, ...getUserConfig() };

  context.subscriptions.push(
    commands.registerCommand("GBK2UTF8.convert", convertWithProgress)
  );

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
    for (let i = 0; i < selectedFiles.length; i++) {
      const item = selectedFiles[i];
      const uri = Uri.file(item.fsPath);
      tasks.push(replaceContent(uri, true, progress));
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
  console.log(detectedEncoding);
  return detectedEncoding;
}

/**
 * change the file content to utf8
 * @param filePath the file path
 * @param encoding
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
 * replace the editor content with new encoding content
 * @param uri
 * @param force
 * @param progress
 * @returns
 */
async function replaceContent(
  uri: Uri,
  force: boolean = false,
  progress?: any
) {
  const fsPath = uri.fsPath;
  let { encoding, confidence } = detectEncoding(fsPath);
  confidence = Number(confidence.toFixed(2));

  if (config.neededConvertCharset.indexOf(encoding) === -1) {
    if (force) {
      const message = `It seems that the file encoding(${encoding}) is not GBK related.`;
      window.showWarningMessage(message);
    }
    return { uri, encoding, confidence, change: false };
  }

  let dirIsIgnored = false;
  for (let dir of defaultConfig.ignoreDir) {
    if (fsPath.indexOf(dir) !== -1) {
      dirIsIgnored = true;
      break;
    }
  }
  if (dirIsIgnored && !force) {
    return { uri, encoding, confidence, change: false };
  }

  const fileExt = fsPath.split(".").pop() || "";
  const fileName = uri.path.split("/").pop();

  if (defaultConfig.ignoreExtensions.includes(fileExt)) {
    return { uri, encoding, confidence, change: false };
  }
  const message = `It seems that the encoding of **${fileName}** is ${encoding}, do you want to convert it to UTF8?`;
  const writeToFile = async () => {
    const content = await reEncodingContent(fsPath, encoding);
    await workspace.fs.writeFile(uri, Buffer.from(content));
    progress.report({ message: `${fileName}` });
    return { uri, encoding, confidence, change: true };
  };

  if (force) {
    return await writeToFile();
  }

  const answer = await window.showInformationMessage(message, "Yes", "No");

  if (answer === "Yes") {
    return await writeToFile();
  } else {
    return { uri, encoding, confidence, change: false };
  }
}

function convertWithProgress(clickedFile: any, selectedFiles: any) {
  const options = {
    location: ProgressLocation.Window,
    cancellable: false,
    title: "Convert",
  };
  window.withProgress(options, async (progress) => {
    progress.report({ message: "start convert..." });
    const result = await convert(clickedFile, selectedFiles, progress);
    await writeLogFile(result, selectedFiles.length);
  });
}

type LogItem = {
  uri: Uri;
  encoding: string;
  confidence: number;
  change: boolean;
};

async function writeLogFile(result: LogItem[], count: number) {
  if (workspace.workspaceFolders) {
    const convertedList = result.filter((it) => it.change);
    const notConvertList = result.filter((it) => !it.change);

    let writeContent = `# Process result (${count})\n`;
    writeContent += `\n> item format: [encoding/confidence][file path]\n`;

    writeContent += `\n## Converted (${convertedList.length})\n\n`;

    const template = (item: LogItem) =>
      `- \`[${item.encoding}/${item.confidence}]\` \`${item.uri.fsPath}\`\n`;

    convertedList.forEach((item) => {
      writeContent += template(item);
    });

    writeContent += `\n## Not convert (${notConvertList.length})\n\n`;

    notConvertList.forEach((item) => {
      writeContent += template(item);
    });

    const rootFolder = workspace.workspaceFolders[0];
    const fileName = `${extensionName}-result-${Math.floor(
      Math.random() * 100000
    )}.md`;
    const filePath = rootFolder.uri.fsPath + `/${fileName}`;
    fs.writeFileSync(filePath, writeContent);

    const doc = await workspace.openTextDocument(filePath);
    await window.showTextDocument(doc);
  }
}
