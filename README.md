# GBK to UTF8 for vscode

The vscode extension for convert the GBK encode to UTF8.

一个用来把 GBK 编码文件转换为 UTF8 的 vscode 插件。

## Install

Open VSCode and type `ctrl+P`, type `ext install buuug7.GBK2UTF8`, or search the market with **gbk, gbk utf8** keywords.

## Usage

When you open the file with the GBK encode, it will show a prompt dialog suggest you convert it. or you can manual convert it with the **Convert encode to utf8** commander from the Command palette.

## settings

> please `reload the window` after the settings is changed, make sure the setting is activated in the vscode startup.

- autoDetect
- ignoreFileExtensions

The `autoDetect` is set to `true` default, if you want to disable the autoDetect GBK files, set `false` in the user and workspace settings under Extensions -> GBK2UTF8 section.

The `ignoreFileExtensions` is set to `ts` default, if you want add more ignore file extensions, please set it separated by comma in the user and workspace settings under Extensions -> GBK2UTF8 section.
