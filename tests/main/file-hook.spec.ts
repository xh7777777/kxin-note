// Mock electron app
jest.mock('electron', () => ({
  app: {
    isPackaged: false,
    getPath: jest.fn((path: string) => {
      if (path === 'userData') {
        return '/tmp/test-user-data';
      }
      return '/tmp';
    }),
    getAppPath: jest.fn(() => '/tmp/app'),
  },
  ipcMain: {
    handle: jest.fn(),
  },
}));
// Mock fs promises
jest.mock('fs', () => ({
  promises: {
    access: jest.fn(),
    mkdir: jest.fn(),
    readFile: jest.fn(),
    writeFile: jest.fn(),
    readdir: jest.fn(),
  },
}));

// upload file in a note

// get file info

// get file list in a note file

// soft delete file

// delete files

// batch delete files

// restore file
