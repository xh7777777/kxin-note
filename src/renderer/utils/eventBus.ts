import mitt from 'mitt';

export enum EventBusKey {
  EditorSave = 'editorSave',
}

export const eventBus = mitt();
