# GBK to UTF8 for VS Code

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

将 GBK 相关编码（GB2312、GB18030、Big5 等）的文件自动检测并转换为 UTF-8 编码的 VS Code 扩展，支持单文件和批量转换。

---

## Features

- ✨ **自动检测** — 打开文件时自动检测编码，发现 GBK 相关编码时提示转换
- 📁 **批量转换** — 选中多个文件或文件夹，右键一键批量转换为 UTF-8
- 📊 **转换报告** — 批量转换后自动生成 Markdown 格式的转换结果报告
- 🔧 **可配置** — 支持自定义忽略目录和文件扩展名
- 🔒 **文件备份** — 转换前自动备份原文件，文件名追加 `.bak.` + 时间戳
- 🚫 **智能跳过** — 自动跳过已配置的忽略目录和扩展名

## 安装

### 从 VS Code 市场安装

打开 VS Code，按 `Ctrl + P`，输入以下命令安装：

```
ext install buuug7.GBK2UTF8
```

或者在扩展市场中搜索 **gbk**、**gbk2utf8** 等关键字安装。

## 使用方法

### 右键菜单

文件浏览树右键或者编辑器内右键, 在弹出的菜单中选择 **Convert Encoding To UTF8** 将文件转换成 UTF8 编码.

### 通过命令

通过命令面板（`Ctrl + Shift + P`）执行：

```
GBK2UTF8: Convert Encoding To UTF8
```

### 自动转换

当打开一个 GBK 相关编码的文件时，VS Code 右下角会自动弹出提示框：

> Seems the encoding of **filename** is GB2312, do you want to convert it to UTF8?

点击 **Yes** 即可转换，当前文件会被转换为 UTF8 编码。

### 批量转换

在文件资源管理器中：

1. 选中多个文件或文件夹
2. **右键** → **Convert Encoding To UTF8**（自动检测，单文件会弹确认框）

> 如果选择了多个文件夹，只会转换第一个文件夹中的文件。

批量转换完成后，会自动在工作区根目录生成一份 Markdown 报告文件：

```
GBK2UTF8-result-2026-06-09T15-30-22.md
```

### 文件备份

每次转换前，原始文件会在同级目录自动备份，文件名格式：

```
原始文件.txt → 原始文件.txt.bak.2026-06-09T15-30-22
```

## 支持检测的编码

使用 [jschardet](https://github.com/aadsm/jschardet) 库检测编码，支持以下中文编码：

| 编码          | 说明                     |
| ------------- | ------------------------ |
| `GB2312`      | 简体中文（国家标准）     |
| `GB18030`     | 简体中文扩展（含生僻字） |
| `Big5`        | 繁体中文                 |
| `EUC-TW`      | 繁体中文（台湾）         |
| `HZ-GB-2312`  | 简体中文（邮件安全编码） |
| `ISO-2022-CN` | 简体中文（ISO 标准）     |

## 配置

在 VS Code 设置中搜索 `GBK2UTF8`，或在 `settings.json` 中配置：

### 自动检测开关

```json
{
  "GBK2UTF8.autoDetect": true
}
```

默认开启。关闭后不再自动检测和提示转换。

### 忽略文件扩展名

```json
{
  "GBK2UTF8.ignoreExtensions": "git,ts,vue"
}
```

逗号分隔，匹配这些扩展名的文件不会被检测和转换。

### 忽略目录

```json
{
  "GBK2UTF8.ignoreDir": "node_modules,.vscode,.idea,.vscode-test,.github"
}
```

逗号分隔，匹配这些目录名（全路径包含即忽略）的目录不会被递归遍历。

### 批量转换报告

```json
{
  "GBK2UTF8.showBatchReport": true
}
```

批量转换完成后是否自动生成并打开 Markdown 报告文件。

> 修改设置后建议**重新加载窗口**使配置生效。

## 变更日志

详见 [CHANGELOG.md](./CHANGELOG.md)。

## 贡献

欢迎贡献代码或提交 Issue！

- Fork [项目仓库](https://github.com/buuug7/gbk2utf8-vscode.git)
- 创建特性分支：`git checkout -b feature/my-feature`
- 提交改动：`git commit -am 'Add some feature'`
- 推送分支：`git push origin feature/my-feature`
- 提交 Pull Request

## 许可

[MIT](./LICENSE)
