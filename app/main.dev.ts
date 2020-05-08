/* eslint global-require: off, no-console: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 */
import { app, BrowserWindow } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { Interceptor } from './utils/interceptor';
import { Communication } from './utils/communication';
import { setWindow } from './window';
import { Channels } from './utils/config';

// Standard scheme must be registered before the app is ready
app.setAsDefaultProtocolClient('iisy');

export default class AppUpdater {
  constructor(comm: Communication) {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.setFeedURL({
      provider: 'github',
      owner: 'Fishermanhealth-Gmbh',
      repo: 'client',
      token: '3d998cdbee2958350360479f63d63c03f0b5549f'
    });
    autoUpdater.on('error', err => {
      comm.sendToReact(Channels.SHOW_MSG, {
        msg: err,
        variant: 'warning'
      });
    });
    autoUpdater.on('checking-for-update', () => {
      // sendStatusToWindow('Checking for update...');

      comm.sendToReact(Channels.SHOW_MSG, {
        msg: 'Checking for Updates',
        variant: 'info'
      });
    });
    autoUpdater.on('update-available', () => {
      // sendStatusToWindow('Update available.');
      comm.sendToReact(Channels.SHOW_MSG, {
        msg: 'Update available. Start download',
        variant: 'success'
      });
    });
    autoUpdater.on('download-progress', ({ percent }) => {
      const _percent = parseInt(percent, 10);
      if (_percent >= 25 && _percent <= 30) {
        comm.sendToReact(Channels.SHOW_MSG, {
          msg: `Download update: ${percent}%`,
          variant: 'info'
        });
      }
      if (_percent >= 50 && _percent <= 55) {
        comm.sendToReact(Channels.SHOW_MSG, {
          msg: `Download update: ${percent}%`,
          variant: 'info'
        });
      }
      if (_percent === 75) {
        comm.sendToReact(Channels.SHOW_MSG, {
          msg: `Download update: ${percent}%`,
          variant: 'info'
        });
      }
    });
    autoUpdater.on('update-downloaded', info => {
      // sendStatusToWindow('Update not available.');
      comm.sendToReact(Channels.SHOW_MSG, {
        msg: 'Update downloaded, will restart now',
        variant: 'success'
      });
      autoUpdater.quitAndInstall();
    });

    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];

  return Promise.all(
    extensions.map(name => installer.default(installer[name], forceDownload))
  ).catch(console.log);
};

const createWindow = async () => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  }

  mainWindow = new BrowserWindow({
    show: false,
    width: 450,
    frame: false,
    height: 728,
    webPreferences:
      process.env.NODE_ENV === 'development' || process.env.E2E_BUILD === 'true'
        ? {
            nodeIntegration: true
          }
        : {
            nodeIntegration: true
          }
  });

  mainWindow.loadURL(`file://${__dirname}/app.html`);

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
    // Set window as static var
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line

  return mainWindow;
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('ready', async () => {
  const mainWindow = await createWindow();
  setWindow(mainWindow);

  const communication = new Communication(app, mainWindow!);

  new AppUpdater(communication);

  new Interceptor(app, mainWindow!, communication);
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
});
