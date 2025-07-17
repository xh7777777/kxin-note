import { contextBridge, ipcRenderer, IpcRendererEvent, shell } from 'electron';
import { platform, release, arch } from 'os';
import { onUnmounted } from 'vue';
import { IpcChannelMainClass, IpcChannelRendererClass } from '../ipc/index';

function getIpcRenderer() {
  const IpcRenderer = {};
  Object.keys(new IpcChannelMainClass()).forEach(channel => {
    IpcRenderer[channel] = {
      invoke: async (args: any) => ipcRenderer.invoke(channel, args),
    };
  });
  Object.keys(new IpcChannelRendererClass()).forEach(channel => {
    IpcRenderer[channel] = {
      on: (listener: (...args: any[]) => void) => {
        ipcRenderer.on(channel, listener);
        onUnmounted(() => {
          ipcRenderer.removeListener(channel, listener);
        });
      },
      once: (listener: (...args: any[]) => void) => {
        ipcRenderer.once(channel, listener);
        onUnmounted(() => {
          ipcRenderer.removeListener(channel, listener);
        });
      },
      removeAllListeners: () => ipcRenderer.removeAllListeners(channel),
    };
  });
  return IpcRenderer;
}

contextBridge.exposeInMainWorld('ipcRendererChannel', getIpcRenderer());

// 暴露新的笔记操作API（与note-hook匹配）
contextBridge.exposeInMainWorld('electronAPI', {
  invoke: (channel: string, ...args: any[]) =>
    ipcRenderer.invoke(channel, ...args),
});

// 保持旧的noteAPI以兼容现有代码
contextBridge.exposeInMainWorld('noteAPI', {
  // 新的API（与note-hook匹配）
  createNote: (request: any) => ipcRenderer.invoke('createNote', request),
  getNoteById: (id: string) => ipcRenderer.invoke('getNoteById', id),
  updateNote: (request: any) => ipcRenderer.invoke('updateNote', request),
  getNotesDirectory: () => ipcRenderer.invoke('getNotesDirectory'),
  getNotesList: () => ipcRenderer.invoke('getNotesList'),
  getNotesListByFilter: (filter: any) =>
    ipcRenderer.invoke('getNotesListByFilter', filter),
  moveToTrash: (id: string) => ipcRenderer.invoke('moveToTrash', id),
  restoreFromTrash: (id: string) => ipcRenderer.invoke('restoreFromTrash', id),
  permanentlyDeleteNote: (id: string) =>
    ipcRenderer.invoke('permanentlyDeleteNote', id),
  rebuildIndex: () => ipcRenderer.invoke('rebuildIndex'),
});

// 暴露文件操作API
contextBridge.exposeInMainWorld('fileAPI', {
  // 上传文件
  uploadFile: (sourcePath: Buffer, fileName: string, options: any) =>
    ipcRenderer.invoke('file:upload', sourcePath, fileName, options),

  // 删除文件
  deleteFile: (fileId: string) => ipcRenderer.invoke('file:delete', fileId),

  // 获取文件信息
  getFileInfo: (fileId: string) => ipcRenderer.invoke('file:getInfo', fileId),

  // 获取文件列表
  getFilesList: (filter: any, page?: number, pageSize?: number) =>
    ipcRenderer.invoke('file:getList', filter, page, pageSize),

  // 获取文件统计
  getFileStats: (noteId?: string) =>
    ipcRenderer.invoke('file:getStats', noteId),

  // 批量删除笔记文件
  deleteNoteFiles: (noteId: string) =>
    ipcRenderer.invoke('file:deleteNoteFiles', noteId),

  // 选择文件对话框
  selectFiles: (options: any) =>
    ipcRenderer.invoke('file:selectFiles', options),

  // 选择目录对话框
  selectDirectory: (options: any) =>
    ipcRenderer.invoke('file:selectDirectory', options),
});

contextBridge.exposeInMainWorld('systemInfo', {
  platform: platform(),
  release: release(),
  arch: arch(),
});

contextBridge.exposeInMainWorld('shell', shell);

contextBridge.exposeInMainWorld('crash', {
  start: () => {
    process.crash();
  },
});

// 暴露编辑器操作API
contextBridge.exposeInMainWorld('editorAPI', {
  // 监听撤销操作
  onUndo: (callback: () => void) => {
    const wrappedCallback = () => callback();
    ipcRenderer.on('EditorUndo', wrappedCallback);
    return () => ipcRenderer.removeListener('EditorUndo', wrappedCallback);
  },

  // 监听重做操作
  onRedo: (callback: () => void) => {
    const wrappedCallback = () => callback();
    ipcRenderer.on('EditorRedo', wrappedCallback);
    return () => ipcRenderer.removeListener('EditorRedo', wrappedCallback);
  },

  // 监听保存操作
  onSave: (callback: () => void) => {
    const wrappedCallback = () => callback();
    ipcRenderer.on('EditorSave', wrappedCallback);
    return () => ipcRenderer.removeListener('EditorSave', wrappedCallback);
  },

  // 监听搜索操作
  onSearch: (callback: () => void) => {
    const wrappedCallback = () => callback();
    ipcRenderer.on('Search', wrappedCallback);
    return () => ipcRenderer.removeListener('Search', wrappedCallback);
  },

  // 移除所有编辑器监听器
  removeAllListeners: () => {
    ipcRenderer.removeAllListeners('EditorUndo');
    ipcRenderer.removeAllListeners('EditorRedo');
    ipcRenderer.removeAllListeners('EditorSave');
  },
});
