import { App, dialog, BrowserWindow, IpcMainEvent } from 'electron';
import { Filesystem, IndesignVersion } from './filesystem';
import { Client } from './client';
import { ReadStream, createReadStream } from 'fs';
import { Communication } from './communication';
import { Channels } from './config';
import { Asset } from '../interfaces/asset';
import { basename } from 'path';

export class Interceptor {
  private filesystem: Filesystem;
  private lastTokenPath: string | undefined;
  app: App;
  mainWindow: BrowserWindow;
  communication: Communication;

  constructor(
    app: App,
    mainWindow: BrowserWindow,
    communication: Communication
  ) {
    this.app = app;
    this.mainWindow = mainWindow;
    this.communication = communication;
    this.filesystem = new Filesystem(app, communication);

    // @ts-ignore
    app.on('open-url', this.onIISYURLHit.bind(this));
    communication.consumeFromReact(
      Channels.ASSET_IS_READY,
      this.onFileReady.bind(this)
    );
    communication.consumeFromReact(
      Channels.OPEN_ASSET,
      async (e, filename: string) => {
        try {
          await this.filesystem.openWithVersion(IndesignVersion.A20, filename);
          
        } catch (error) {
          console.log(error);
        }
      }
    );
    communication.consumeFromReact(
      Channels.REMOVE_ASSET,
      async (e, asset: Asset) => {
        await this.filesystem.removeTmpFile(asset.tmpFilename!);
      }
    );
  }

  async onFileReady(event: IpcMainEvent, data: Asset) {
    try {
      this.communication.startLoading(0);
      const client = new Client(data.token);
      await client.checkToken(true);
      this.communication.sendToReact(Channels.SHOW_MSG, {
        variant: 'info',
        msg: 'Starting file upload'
      });
      const size = this.filesystem.getFileSize(data.tmpFilename!);
      if (size.shouldTakeLong) {
        this.communication.sendToReact(Channels.SHOW_MSG, {
          variant: 'info',
          msg: `File is greater then 16 MB. It will take longer. (${size.readable})`
        });
      }

      const base = basename(data.tmpFilename!).split('.')[0];
      await client.uploadTmp(
        base,
        this.filesystem.getTmpFile(
          this.filesystem.getTmpFilePath(data.tmpFilename!)
        )
      );
      this.communication.sendToReact(Channels.SHOW_MSG, {
        variant: 'success',
        msg: 'File uploaded'
      });
      this.communication.sendToReact(Channels.SHOW_MSG, {
        variant: 'info',
        msg: 'Starting checkout process'
      });
      await client.checkout('-', data.tmpFilename!, data.mainAssetId!);
      this.communication.sendToReact(Channels.SHOW_MSG, {
        variant: 'success',
        msg: 'Asset updated'
      });
      this.filesystem.removeTmpFile(data.tmpFilename!);

      this.communication.sendToReact(Channels.REMOVE_ASSET, data);
    } catch (error) {
      this.communication.sendToReact(Channels.SHOW_MSG, {
        variant: 'warning',
        msg: 'Not able to update slide'
      });
      console.log(error);
    } finally {
      this.communication.stopLoading(0);
    }
  }

  async onIISYURLHit(_: Event, _url: string) {
    this.mainWindow.show();
    this.mainWindow.focus();
    const url = new URL(_url);
    const host = url.host;
    /**
     * URL TOKEN bsp: iisy://5db19bf1593eaa0012541b58+group+6735ef1b-8ae7-4191-8ee2-0651f5ffa365.indd+5c5da322c22d5fa8072cc658+eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1ODgwMDQxMTYsImlhdCI6MTU4Nzk3ODkxNiwicm9sZXMiOlsiYWRtaW4iXSwic3ViIjpbImFkbWluIl0sImlzcyI6IjVjNWRhMzIyYzIyZDVmYTgwNzJjYzY1OCIsImp0aSI6InYxIiwic2NvcGUiOlt7fV19.ft54yOzlyjzuJdLyoch9npY40xSv1igMxrh01p6DeeQ
5c5da322c22d5fa8072cc658.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1ODgwMDQxMTYsImlhdCI6MTU4Nzk3ODkxNiwicm9sZXMiOlsiYWRtaW4iXSwic3ViIjpbImFkbWluIl0sImlzcyI6IjVjNWRhMzIyYzIyZDVmYTgwNzJjYzY1OCIsImp0aSI6InYxIiwic2NvcGUiOlt7fV19.ft54yOzlyjzuJdLyoch9npY40xSv1igMxrh01p6DeeQ
     */
    let [mainSlide, group, tmpFilename, user, token] = host.split('+');

    // TODO: I18N
    if (!token) {
      dialog.showErrorBox(
        'Missing Authentication Token',
        'Please try to check out the asset again.'
      );
      throw new Error('Token not provided');
    }
    this.communication.sendToReact(Channels.SHOW_MSG, {
      variant: 'info',
      msg: 'Starting download'
    });
    this.lastTokenPath = this.filesystem.saveToken(token);
    const client = new Client(token);
    await client.checkToken(true);

    if (client.token !== token) {
      token = client.token!;
    }

    try {
      this.communication.startLoading(0);
      const { data } = await client.download(tmpFilename);
      const localFilePath = await this.filesystem.saveTmpStream(
        (data as unknown) as ReadStream,
        tmpFilename
      );

      this.communication.sendToReact(Channels.SHOW_MSG, {
        variant: 'success',
        msg: `Downloaded asset ${mainSlide} successfully`
      });
      this.communication.sendToReact(Channels.ASSET_IS_READY, {
        token,
        mainAssetId: mainSlide,
        group,
        tmpFilename
      });

      /** SHould we open the file? */
      await this.filesystem.openWithVersion(IndesignVersion.A20, tmpFilename);
      
      this.mainWindow.focus();

      /** BLOCK ITEM WHEN DOWNLOADED */
    } catch (error) {
      this.communication.sendToReact(Channels.SHOW_MSG, {
        variant: 'warning',
        msg: 'File not found in the cloud'
      });
    } finally {
      this.communication.stopLoading(0);
    }

    // START DOWNLOADING PROCESS
  }
}
