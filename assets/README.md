# Assets Directory

这个目录用于存储应用程序的资产文件。

## 目录结构

- `notes/` - 开发模式下的笔记数据存储目录
  - `*.json` - 各个笔记的详细内容文件
  - `notes-index.json` - 笔记索引文件（包含所有笔记的基本信息）

## 笔记索引系统

为了优化性能，系统使用索引文件来管理笔记列表：

### 索引文件结构

```json
{
  "version": "1.0.0",
  "lastUpdated": "2024-01-15T10:30:00.000Z",
  "notes": [
    {
      "id": "uuid",
      "title": "笔记标题",
      "icon": "📝",
      "filePath": "/path/to/note.json",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "createdAt": "2024-01-15T10:00:00.000Z",
      "parentId": "parent-uuid",
      "level": 0,
      "isFavorite": false,
      "isArchived": false
    }
  ]
}
```

### 优势

- **快速加载**: 获取笔记列表时只需读取索引文件，无需遍历所有笔记文件
- **内存效率**: 列表显示只加载必要的基本信息
- **按需加载**: 笔记详细内容只在需要时才加载

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
- 索引文件会在首次运行时自动创建或重建
- assets目录结构会被保留在版本控制中
- 切换到生产模式时，数据会自动存储到正确的用户目录中
