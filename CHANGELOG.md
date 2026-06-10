# Change Log

## 0.7.3 - 2026/06/10

- fix: 跳过虚拟/不存在的文件路径，避免 detectEncoding 在 git temp 和 exthost 路径上报错
- feat: 移除备份文件中的时间戳，恢复 `.bak` 命名方式
- docs: 更新插件使用说明
- feat: 更新 package.json 搜索关键词列表

## 0.7.2 - 2026/06/09

- feat: update extension icons

## 0.7.1 - 2026/06/09

- fix: replace shield.io badges with vsmarketplacebadges.dev due to incorrect "retired" status

## 0.7.0 - 2026/06/09

- refactor: modularize extension with clean architecture and proper types
- feat: add file backup before conversion (`.bak.` + timestamp)
- feat: add editor context menu support
- feat: add batch convert command (silent mode)
- feat: improve conversion report with summary stats and encoding distribution
- fix: resolve F5 debug startup issue (upgrade webpack to 5.107+)
- docs: add README in both Chinese and English
- docs: add CLAUDE.md with project documentation

## 0.6.0 - 2020/07/17

- update batch encoding support nested folders
- add `showBatchReport` setting, when batch convert encoding, show convert report result.

## 0.5.1 - 2020/07/16

- add batch convert support directory(not nested directory)

## 0.5.0 - 2020/07/16

- add convert result report file
- refactor code
- update dependencies

## 0.4.0 - 2020/07/15

- add feature of batch convert
- use the [jschardet](https://github.com/aadsm/jschardet) detect file encoding

## 0.3.1 -2021/05/10

- fix
- update README.md

## 0.3.0 - 2021/05/09

- add ignoreDir setting

## 0.2.11 - 2021/05/08

- fix, update README.md
- update the extension icon
- fix the issue of ignoreExtensions not work

## 0.2.0 - 2021/05/04

- add autoDetect setting
- add ignoreExtensions setting
