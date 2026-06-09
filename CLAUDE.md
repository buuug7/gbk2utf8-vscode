# GBK2UTF8 VS Code Extension

Convert file encoding from GBK related encodings (GB2312, GB18030, Big5, etc.) to UTF-8 for VS Code.

## Project Overview

- **Publisher**: `buuug7`
- **Extension ID**: `buuug7.GBK2UTF8`
- **Entry**: [src/extension.ts](src/extension.ts)
- **Output**: `dist/extension.js` (webpack bundle)

## Tech Stack

- **Language**: TypeScript 4.3
- **Build**: webpack 5 + ts-loader
- **Encoding Detection**: jschardet
- **Encoding Conversion**: iconv-lite
- **Test**: mocha + vscode-test

## Development

### Setup

```bash
npm install
```

### Build

```bash
npm run compile       # webpack bundle (production)
npm run watch         # webpack watch mode
npm run test-compile  # tsc compile for tests (output to out/)
```

### Debug (F5)

Debug config is in [.vscode/launch.json](.vscode/launch.json):

- **Run Extension** — compiles the extension via `npm run compile`, then opens a new Extension Development Host window
- **Extension Tests** — runs tests in a development host window

> **Note**: The `preLaunchTask` uses `npm: compile` (not `npm: watch`) for reliable startup. If you want watch mode (auto-recompile on changes), change back to `npm: watch` in [launch.json](.vscode/launch.json#L18), but the `$ts-webpack-watch` problem matcher must work correctly in your VS Code version.

### Package for Marketplace

```bash
npm run package       # webpack --mode production
vsce package          # create .vsix file
```

## Source Code Structure

```
src/
├── extension.ts              # Thin activation entry point
├── config.ts                 # Config type definition and getUserConfig()
├── constants.ts              # Shared constants
├── types.ts                  # Shared type/interface definitions
├── commands/
│   └── convertCommand.ts     # Command registration + progress + orchestration
├── services/
│   ├── encodingDetector.ts   # Encoding detection via jschardet (async)
│   ├── converter.ts          # File conversion via iconv-lite stream
│   └── fileCollector.ts      # Directory walk + ignore rules
├── utils/
│   └── reportWriter.ts       # Batch conversion report generation
└── test/
    ├── runTest.ts            # Test runner entry
    └── suite/
        ├── index.ts          # Mocha test index
        └── extension.test.ts # Extension tests
```

```

### Key Functions

- **`activate(context)`** ([src/extension.ts](src/extension.ts)) — registers `GBK2UTF8.convert` command; if `autoDetect` is enabled, hooks `onDidOpenTextDocument` for auto-conversion
- **`registerConvertCommand(context)`** ([src/commands/convertCommand.ts](src/commands/convertCommand.ts)) — registers the command with VS Code, wraps conversion in progress dialog, coordinates detect → convert → report pipeline
- **`collectFiles(clickedFile, selectedFiles, config)`** ([src/services/fileCollector.ts](src/services/fileCollector.ts)) — collects files from selection/editor, recursively walks directories, applies ignore rules
- **`detectEncoding(filePath)`** ([src/services/encodingDetector.ts](src/services/encodingDetector.ts)) — reads first 512 bytes via async I/O and uses jschardet to detect encoding
- **`convertToUtf8(filePath, encoding)`** ([src/services/converter.ts](src/services/converter.ts)) — streams file through iconv-lite decoder, returns UTF-8 string
- **`writeReport(results, rootUri)`** ([src/utils/reportWriter.ts](src/utils/reportWriter.ts)) — generates a timestamped Markdown report after batch conversion

## Configuration

Settings under `GBK2UTF8.*` namespace, defined in [package.json](package.json#L53-L80):

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `autoDetect` | boolean | `true` | Auto detect file encoding on open |
| `ignoreExtensions` | string | `git,ts,vue` | Comma-separated extensions to skip |
| `ignoreDir` | string | `node_modules,.vscode,.idea,.vscode-test,.github` | Comma-separated dirs to skip |
| `showBatchReport` | boolean | `true` | Show report after batch conversion |

Supported charsets for conversion: `Big5`, `GB2312`, `GB18030`, `EUC-TW`, `HZ-GB-2312`, `ISO-2022-CN`

## Commands

- **`GBK2UTF8.convert`** (title: "Convert Encoding To UTF8") — available in command palette and explorer context menu

## Commit Convention

Commit messages must end with the following sign-off line:

```

Co-Authored-By: deepseek-v4-flash

```

## Known Issues / Notes

- The project uses Node.js 20+ with webpack 5.107+ (upgraded from 5.44 to fix `ERR_OSSL_EVP_UNSUPPORTED`)
- Tests use `vscode-test` (superseded by `@vscode/test-electron` in newer projects)
- `eslint` is available but lint config is minimal
- The test suite only has a sample test — real test coverage is limited
```
