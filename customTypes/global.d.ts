import { ipcRenderer, shell } from 'electron';
import type { IIpcRendererInvoke, IIpcRendererOn } from '../src/ipc/index';
import type { NotePage } from '../src/common/models/note.types';

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

interface AnyObject {
  [key: string]: any;
}

interface memoryInfo {
  jsHeapSizeLimit: number;
  totalJSHeapSize: number;
  usedJSHeapSize: number;
}

/**
 * 笔记API响应结果
 */
interface NoteAPIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * 笔记API接口
 */
interface NoteAPI {
  /**
   * 创建新笔记
   * @param title 笔记标题
   * @param parentId 父页面ID
   * @returns Promise<NoteAPIResponse<NotePage>>
   */
  createNote: (
    title?: string,
    parentId?: string
  ) => Promise<NoteAPIResponse<NotePage>>;

  /**
   * 获取笔记
   * @param noteId 笔记ID
   * @returns Promise<NoteAPIResponse<NotePage>>
   */
  getNote: (noteId: string) => Promise<NoteAPIResponse<NotePage>>;

  /**
   * 获取所有笔记
   * @returns Promise<NoteAPIResponse<NotePage[]>>
   */
  getAllNotes: () => Promise<NoteAPIResponse<NotePage[]>>;
}

declare global {
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
