import { Channels } from './config';
import Events from './events';
import { BrowserWindow } from 'electron';
import { Communication } from './communication';

export class Auth {
  static isLogginIn: boolean = false;
  static authAgain(mainProcess: boolean = false): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!Auth.isLogginIn) {
        if (mainProcess) {
          const window = BrowserWindow.getFocusedWindow();
          if (window) {
            window.webContents.send(Channels.SYNC_LOGIN_DIALOG, true);
          }
        } else {
          Events.emit(Channels.SYNC_LOGIN_DIALOG, true);
        }
      }
      Auth.isLogginIn = true;
      const resolvePromise: (...args: any[]) => void = data => {
        if (!data || !data.token) reject('No token provided');
        console.log(data.token);
        resolve(data.token);
      };
      if (mainProcess) {
        new Communication().consumeFromReact(
          Channels.SYNC_AUTH_TOKEN,
          (_, data) => resolvePromise(data)
        );
      } else {
        Events.on(Channels.SYNC_AUTH_TOKEN, resolvePromise);
      }
    });
  }
  static hideDialog() {
    Events.emit(Channels.SYNC_LOGIN_DIALOG, false);
    const window = BrowserWindow.getFocusedWindow();
    if (window) {
      window.webContents.send(Channels.SYNC_LOGIN_DIALOG, false);
    }
    Events.removeAllListeners(Channels.SYNC_AUTH_TOKEN);
  }
}
