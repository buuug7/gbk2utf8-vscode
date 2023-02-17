# GBK to UTF8 for vscode

<p>
    <a href="https://marketplace.visualstudio.com/items?itemName=buuug7.gbk2utf8">
        <img src="https://vsmarketplacebadges.dev/version-short/buuug7.gbk2utf8.svg" alt="version">
    </a>
    <a href="https://marketplace.visualstudio.com/items?itemName=buuug7.gbk2utf8">
        <img src="https://vsmarketplacebadges.dev/installs-short/buuug7.gbk2utf8.svg" alt="installs">
    </a>
    <a href="https://marketplace.visualstudio.com/items?itemName=buuug7.gbk2utf8">
        <img src="https://vsmarketplacebadges.dev/downloads-short/buuug7.gbk2utf8.svg" alt="downloads">
    </a>
    <a href="https://marketplace.visualstudio.com/items?itemName=buuug7.gbk2utf8">
        <img src="https://vsmarketplacebadges.dev/rating-short/buuug7.gbk2utf8.svg" alt="rating">
    </a>
</p>

用来把 GBK 相关编码文件转换为 UTF8 的 vscode 插件, 并且具有批量转换文件编码的功能。

[English readme](./README_EN.md)

## 安装

键入`ctrl + p`, 输入 `ext install buuug7.GBK2UTF8` 安装, 或者在扩展市场中搜索 **gbk, gbk utf8** 等关键字来安装.

## 用法

当从 vscode 中打开带有 GBK 相关编码文件的时候, 会自动弹出提示框提示是否转换. 或者你可以在命令面板中通过 **Convert encoding to UTF8** 命令手动转换。

你还可以批量转换文件编码，选中左侧文件浏览树中的多个文件, 或者选择文件夹，右键单击并从上下文中选择 **Convert encoding to UTF8** 选项来批量转换。

## 如何批量转换为 UTF8

批量转换文件编码，选中左侧文件浏览树中的多个文件, 或者选择文件夹，右键单击并从上下文中选择**批量转换编码为 UTF8**选项。注意如果一次选择多个文件夹, 只会转换第一个文件夹中的文件. 批量转换的时候会默认生成转换结果报告文件, 你可以通过设置`GBK2UTF8.showBatchReport: false` 禁止这种行为.

## Support Charset

插件使用了 [jschardet](https://github.com/aadsm/jschardet) 来检测文件编码, 支持以下几种类型的中文简繁体编码.

- `Big5`
- `GB2312`
- `GB18030`
- `EUC-TW`
- `HZ-GB-2312`
- `ISO-2022-CN`

## Settings

The `GBK2UTF8.autoDetect` is set to `true` default, if you want to disable the autoDetect GBK related files,
set `false` in the user and workspace settings under Extensions -> GBK2UTF8 section.

```json
{
  "GBK2UTF8.autoDetect": true
}
```

The `GBK2UTF8.ignoreExtensions` is set to `git,ts,vue` default, if you want add more ignore file extensions, please set
it separated by comma in the user and workspace settings under Extensions -> GBK2UTF8 section.

```json
{
  "GBK2UTF8.ignoreExtensions": "git,ts,vue"
}
```

The `GBK2UTF8.ignoreDir` is set to `node_modules,.vscode,.idea,.vscode-test,.github` default, if you want add more
ignore directory, set it separated by comma in the user and workspace settings under Extensions -> GBK2UTF8 section.

```json
{
  "GBK2UTF8.ignoreDir": "node_modules,.vscode,.idea,.vscode-test,.github"
}
```

The `GBK2UTF8.showBatchReport` is set to `true` default, show convert report result when batch convert encoding, show
convert report result.

```json
{
  "GBK2UTF8.showBatchReport": true
}
```

please `reload the window` after the settings is being change, make sure the setting are take effect.

## Contribution

If you're interested in contributing to, fork the [repo](https://github.com/buuug7/gbk2utf8-vscode.git) and submit pull
requests.
