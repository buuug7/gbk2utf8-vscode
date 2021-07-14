# GBK to UTF8 for vscode

<p>
    <a href="https://marketplace.visualstudio.com/items?itemName=buuug7.gbk2utf8">
        <img src="https://vsmarketplacebadge.apphb.com/version-short/buuug7.gbk2utf8.svg" alt="version">
    </a>
    <a href="https://marketplace.visualstudio.com/items?itemName=buuug7.gbk2utf8">
        <img src="https://vsmarketplacebadge.apphb.com/installs-short/buuug7.gbk2utf8.svg" alt="installs">
    </a>
    <a href="https://marketplace.visualstudio.com/items?itemName=buuug7.gbk2utf8">
        <img src="https://vsmarketplacebadge.apphb.com/rating-short/buuug7.gbk2utf8.svg" alt="rating">
    </a>
</p>

一个用来把 GBK 相关编码文件转换为 UTF8 的 vscode 插件。具有批量转换文件编码的功能。

The vscode extension for convert the GBK related encoding to UTF8. have the feature of batch convert file encoding.

## Install

Open vscode and type `ctrl + p`, type `ext install buuug7.GBK2UTF8`, or search the extensions market with **gbk, gbk
utf8** keywords.

## Usage

当从 vscode 中打开带有 GBK 相关编码文件的时候, 会自动弹出提示对话框提示转换. 或者你可以在命令面板中通过**Convert encoding to UTF8**命令手动转换。

你也可以在左侧的文件浏览树中选择单个文件或多个文件，右键单击并从上下文中选择 **Convert encoding to UTF8** 选项。

When open the file with the GBK related(GB2312, GB18030, ...) encoding from vscode, it will show a prompt dialog suggest
converting it. Or you can be manual convert it with the **Convert encoding to UTF8** commander from the Command palette.

Also, you can select single file or multiply files in the left file explore tree, right click and select the **Batch
Convert encoding to UTF8** item from context.

## How to Batch convert file encoding to UTF8

批量转换文件编码，选中左侧文件浏览树中的多个文件，右键单击并从上下文中选择**批量转换编码为 UTF8**选项。

Selected multiply files in the left file explore tree, right click and select the **Convert encoding to UTF8** item from
context.

## Support Charset

The detected encoding is use the library of [jschardet](https://github.com/aadsm/jschardet), support traditional and
simplified Chinese encoding below.

- `Big5`
- `GB2312`
- `GB18030`
- `EUC-TW`
- `HZ-GB-2312`
- `ISO-2022-CN`

## Settings

The `GBK2UTF8.autoDetect` is set to `true` default, if you want to disable the auto detect GBK related files,
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

please `reload the window` after the settings is being change, make sure the setting tack effect in the vscode startup.

## Contribution

If you're interested in contributing to, fork the [repo](https://github.com/buuug7/gbk2utf8-vscode.git) and submit pull
requests.
