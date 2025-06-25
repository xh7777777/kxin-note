import { ipcRenderer, shell } from 'electron';
import type { IIpcRendererInvoke, IIpcRendererOn } from '../src/ipc/index';
import type { NoteAPI } from './interface/noteApi.type';
import type { INote } from './models/note.types';

/**
 * 渲染进程给主进程发送消息
 */
type IpcRendererInvoke = {
  [key in keyof IIpcRendererInvoke]: {
    /**
     * 渲染进程给主进程发送消息
     * @param args 参数
     * @returns
     */
    invoke: IIpcRendererInvoke[key];
  };
};

/**
 * 渲染进程监听事件
 */
type IpcRendererOn = {
  [key in keyof IIpcRendererOn]: {
    /**
     * 渲染进程监听事件
     * @param listener 监听事件
     * @returns
     */
    on: (listener: IIpcRendererOn[key]) => void;
    /**
     * 渲染进程监听一次事件
     * @param listener
     * @returns
     */
    once: (listener: IIpcRendererOn[key]) => void;
    /**
     * 渲染进程移除所有监听
     * @returns
     */
    removeAllListeners: () => void;
  };
};

/**
 * Electron API接口
 */
interface ElectronAPI {
  invoke: (channel: string, ...args: any[]) => Promise<any>;
}

interface AnyObject {
  [key: string]: any;
}

interface memoryInfo {
  jsHeapSizeLimit: number;
  totalJSHeapSize: number;
  usedJSHeapSize: number;
}

declare global {
  /**
   * Vite build-time constants
   */
  const __ISWEB__: number;
  const __CONFIG__: any;

  interface Window {
    performance: {
      memory: memoryInfo;
    };
    /**
     * 渲染进程的IPC通道
     * 但是只能是给主进程发消息(invoke)和监听主进程的消息(on/once)
     */
    ipcRendererChannel: IpcRendererInvoke & IpcRendererOn;

    /**
     * Electron通用API
     */
    electronAPI: ElectronAPI;

    /**
     * 笔记操作API
     */
    noteAPI: NoteAPI;

    systemInfo: {
      platform: string;
      release: string;
      arch: string;
      nodeVersion: string;
      electronVersion: string;
    };
    shell: typeof shell;
    crash: {
      start: () => void;
    };
  }
}
