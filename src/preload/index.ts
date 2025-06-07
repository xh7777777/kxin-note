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

// 暴露笔记操作API
contextBridge.exposeInMainWorld('noteAPI', {
  // 创建新笔记
  createNote: (title?: string, parentId?: string) =>
    ipcRenderer.invoke('note:create', title, parentId),

  // 获取笔记
  getNote: (noteId: string) => ipcRenderer.invoke('note:get', noteId),

  // 获取所有笔记
  getAllNotes: () => ipcRenderer.invoke('notes:getAll'),

  // 重建笔记索引
  rebuildIndex: () => ipcRenderer.invoke('notes:rebuildIndex'),
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
