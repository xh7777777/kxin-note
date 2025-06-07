# Assets Directory

这个目录用于存储应用程序的资产文件。

## 目录结构

- `notes/` - 开发模式下的笔记数据存储目录

## 开发模式 vs 生产模式

### 开发模式

- 笔记数据存储在项目的 `assets/` 目录下
- 方便开发时查看和调试笔记数据
- 这些JSON文件会被 .gitignore 忽略，不会提交到版本控制

### 生产模式

- 笔记数据存储在用户数据目录中
- Windows: `%APPDATA%/[AppName]/`
- macOS: `~/Library/Application Support/[AppName]/`
- Linux: `~/.config/[AppName]/`

## 注意事项

- 开发时生成的笔记文件（\*.json）不会被提交到Git
- assets目录结构会被保留在版本控制中
- 切换到生产模式时，数据会自动存储到正确的用户目录中
