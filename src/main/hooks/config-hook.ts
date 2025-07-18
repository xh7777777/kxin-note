import { promises as fs } from 'fs';
import path from 'path';
import { app, ipcMain } from 'electron';
import { JSONFilePreset } from 'lowdb/node';
