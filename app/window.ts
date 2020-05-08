import { BrowserWindow } from 'electron';
import { log } from 'util';

export let _window: BrowserWindow | null = null;

export function setWindow(window: BrowserWindow) {
  log('set global window object')
  _window = window;
}
