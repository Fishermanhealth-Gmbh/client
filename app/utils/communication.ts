import {
  App,
  BrowserWindow,
  ipcMain,
  IpcMainEvent,
  ipcRenderer,
  IpcRendererEvent
} from 'electron';
import { SnackbarData } from '../interfaces/snackbar';
import { Asset } from '../interfaces/asset';
import { _window } from '../window';
import { Loading } from '../interfaces/loading';
import { Channels } from './config';

export class Communication {
  window: BrowserWindow | undefined;
  app: App | undefined;
  constructor(app?: App, window?: BrowserWindow) {
    this.app = app;
    this.window = window || _window!;
  }

  sendToReact(channel: string, msg: SnackbarData | Asset | Loading | boolean) {
    if (!this.window) {
      console.log(_window);
      this.window = _window!;
    }
    this.window!.webContents.send(channel, msg);
  }

  removeListener(channel: string) {
    ipcRenderer.removeAllListeners(channel);
  }

  consumeFromMain(
    channel: string,
    cb: (event: IpcRendererEvent, ...args: any[]) => void
  ) {
    ipcRenderer.on(channel, cb);
  }

  startLoading(value: number, size?: number) {
    this.sendToReact(Channels.SYNC_LOADING, {
      value,
      variant: 'indeterminate',
      size: size || 0
    });
  }
  stopLoading(_: unknown, size?: number) {
    this.sendToReact(Channels.SYNC_LOADING, {
      value: 100,
      size: size || 0,
      variant: 'determinate'
    });
  }

  consumeFromReact(
    channel: string,
    cb: (event: IpcMainEvent, ...args: any[]) => void
  ) {
    ipcMain.on(channel, cb);
  }
}
