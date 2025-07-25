'use strict';

import { useMainDefaultIpc } from './services/ipc-main';
import { app, session } from 'electron';
import InitWindow from './services/window-manager';
import { useDisableButton } from './hooks/disable-button-hook';
import { useProcessException } from '@main/hooks/exception-hook';
import { useMenu } from '@main/hooks/menu-hook';
import { registerNoteActionHandlers } from './hooks/note-hook';
import { initializeAIConfig } from './hooks/config-hook';
import { initializeAI } from './hooks/ai-hook';
import { startServer } from './server';

async function onAppReady() {
  const { disableF12 } = useDisableButton();
  const { renderProcessGone } = useProcessException();
  const { defaultIpc } = useMainDefaultIpc();
  const { creactMenu } = useMenu();
  disableF12();
  renderProcessGone();
  defaultIpc();
  creactMenu();
  startServer();

  // 注册笔记操作handlers
  registerNoteActionHandlers();

  // 初始化AI配置管理
  try {
    await initializeAIConfig();
  } catch (error) {
    console.error('AI配置初始化失败:', error);
  }

  // 初始化AI模块
  try {
    await initializeAI();
  } catch (error) {
    console.error('AI模块初始化失败:', error);
  }

  new InitWindow().initWindow();
  if (process.env.NODE_ENV === 'development') {
    const { VUEJS_DEVTOOLS } = require('electron-devtools-vendor');
    session.defaultSession.loadExtension(VUEJS_DEVTOOLS, {
      allowFileAccess: true,
    });
    console.log('已安装: vue-devtools');
  }
}

app.whenReady().then(onAppReady);
// 由于9.x版本问题，需要加入该配置关闭跨域问题
app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors');

app.on('window-all-closed', () => {
  // 所有平台均为所有窗口关闭就退出软件
  app.quit();
});
app.on('browser-window-created', () => {
  console.log('window-created');
});

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.removeAsDefaultProtocolClient('electron-vue-template');
    console.log('由于框架特殊性开发环境下无法使用');
  }
} else {
  app.setAsDefaultProtocolClient('electron-vue-template');
}
