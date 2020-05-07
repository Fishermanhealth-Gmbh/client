import { BrowserWindow } from 'electron';

export let _window: BrowserWindow | null = null;

export function setWindow(window: BrowserWindow) {
  console.log(window);
  _window = window;
}
