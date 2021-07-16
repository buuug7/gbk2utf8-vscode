import { workspace } from "vscode";

export type ConfigType = {
  autoDetect: boolean;
  ignoreExtensions: string[];
  ignoreDir: string[];
  neededConvertCharset: string[];
  showBatchReport: boolean;
  isBatch: boolean
};

// get user custom config
export function getUserConfig(): ConfigType {
  const config = workspace.getConfiguration("GBK2UTF8");
  const _ignoreExt = config.get<string>("ignoreExtensions");
  const _ignoreDir = config.get<string>("ignoreDir");

  return {
    // auto detect file encoding with GBK related.
    autoDetect: config.get<boolean>("autoDetect") as boolean,
    // ignore the specified file extensions, separated by comma.
    ignoreExtensions: _ignoreExt ? _ignoreExt.split(",") : config.ignoreExtensions,
    // ignore the specified directory, separated by comma.
    ignoreDir: _ignoreDir ? _ignoreDir.split(",") : [],
    // Traditional and Simplified Chinese
    neededConvertCharset: ["Big5", "GB2312", "GB18030", "EUC-TW", "HZ-GB-2312", "ISO-2022-CN"],
    // When batch convert encoding, show convert report result.
    showBatchReport: config.get<boolean>("showBatchReport") as boolean,
    isBatch: false,
  };
}
