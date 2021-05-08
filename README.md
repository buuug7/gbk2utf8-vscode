# GBK to UTF8 for vscode

The vscode extension for convert the GBK encoding to UTF8.

一个用来把 GBK 编码文件转换为 UTF8 的 vscode 插件。

## Install

Open VSCode and type `ctrl+P`, type `ext install buuug7.GBK2UTF8`, or search the market with **gbk, gbk utf8** keywords.

## Usage

When you open the file with the GBK related(gbk, GB2312, GB18030) encoding, it will show a prompt dialog suggest you convert it. or you can manual convert it with the **convert encoding to utf8** commander from the Command palette.

当打开带有 GBK 相关(GBK, GB2312, GB18030) 编码文件的时候，会弹出一个提示对话框提示转换。或者你可以通过在命令面板中通过`convert encoding to utf8`命令来手动转换。

## settings

The `GBK2UTF8.autoDetect` is set to `true` default, if you want to disable the auto detect GBK files, set `false` in the user and workspace settings under Extensions -> GBK2UTF8 section.

```javascript
{
    "GBK2UTF8.autoDetect": true,
}
```

The `GBK2UTF8.ignoreFileExtensions` is set to `git,ts,vue` default, if you want add more ignore file extensions, please set it separated by comma in the user and workspace settings under Extensions -> GBK2UTF8 section.

```javascript
{
    "GBK2UTF8.ignoreFileExtensions": "git,ts,vue",
}
```

please `reload the window` after the settings is changed, make sure the setting is activated in the vscode startup.

## contribution

If you're interested in contributing to, fork the [repo](https://github.com/buuug7/gbk2utf8-vscode.git) and submit pull requests.
