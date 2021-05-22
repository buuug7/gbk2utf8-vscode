# GBK to UTF8 for vscode

The vscode extension for convert the GBK related encoding to UTF8.

一个用来把 GBK 相关编码文件转换为 UTF8 的 vscode 插件。

## Usage

When open the file with the GBK related(gbk, GB2312, GB18030) encoding from vscode, it will show a prompt dialog in the right bottom corner suggest you convert it. or you can manual convert it with the **Convert encoding to UTF8** commander from the Command palette.

当从 vscode 中打开带有 GBK 相关(GBK, GB2312, GB18030) 编码文件的时候, 在右下角会自动弹出提示对话框提示转换. 或者你可以在命令面板中通过**Convert encoding to UTF8**命令手动转换。

## Install

Open vscode and type `ctrl + p`, type `ext install buuug7.GBK2UTF8`, or search the extensions market with **gbk, gbk utf8** keywords.

## settings

The `GBK2UTF8.autoDetect` is set to `true` default, if you want to disable the auto detect GBK related files, set `false` in the user and workspace settings under Extensions -> GBK2UTF8 section.

```javascript
{
    "GBK2UTF8.autoDetect": true,
}
```

The `GBK2UTF8.ignoreExtensions` is set to `git,ts,vue` default, if you want add more ignore file extensions, please set it separated by comma in the user and workspace settings under Extensions -> GBK2UTF8 section.

```javascript
{
    "GBK2UTF8.ignoreExtensions": "git,ts,vue",
}
```

The `GBK2UTF8.ignoreDir` is set to `node_modules,.vscode,.idea,.vscode-test,.github` default, if you want add more ignore directory, set it separated by comma in the user and workspace settings under Extensions -> GBK2UTF8 section.

```javascript
{
    "GBK2UTF8.ignoreDir": "node_modules,.vscode,.idea,.vscode-test,.github",
}
```

please `reload the window` after the settings is changed, make sure the setting is activated in the vscode startup.

## contribution

If you're interested in contributing to, fork the [repo](https://github.com/buuug7/gbk2utf8-vscode.git) and submit pull requests.
