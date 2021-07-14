import { workspace } from "vscode";

type ConfigType = {
  autoDetect: boolean;
  ignoreExtensions: string[];
  ignoreDir: string[];
  neededConvertCharset: string[];
};

export const config: ConfigType = {
  // auto detect file encoding with GBK related.
  autoDetect: true,

  // ignore the specified file extensions, separated by comma.
  ignoreExtensions: ["git", "ts", "vue"],

  // ignore the specified directory, separated by comma.
  ignoreDir: ["node_modules", ".vscode", ".idea", ".vscode-test", ".github"],

  // Traditional and Simplified Chinese
  neededConvertCharset: [
    "Big5",
    "GB2312",
    "GB18030",
    "EUC-TW",
    "HZ-GB-2312",
    "ISO-2022-CN",
  ],
};

// get user custom config
export function getUserConfig() {
  const config = workspace.getConfiguration("GBK2UTF8");
  const _ignoreExt = config.get<string>("ignoreExtensions");
  const _ignoreDir = config.get<string>("ignoreDir");

  return {
    autoDetect: config.get<boolean>("autoDetect") as boolean,
    ignoreExtensions: _ignoreExt ? _ignoreExt.split(",") : [],
    ignoreDir: _ignoreDir ? _ignoreDir.split(",") : [],
  };
}
