import { App, shell } from 'electron';
import {
  writeFileSync,
  createWriteStream,
  ReadStream,
  open,
  createReadStream,
  unlinkSync,
  readFileSync,
  existsSync,
  mkdirSync,
  stat,
  statSync
} from 'fs';
import { v4 } from 'uuid';
import { join } from 'path';
import { Communication } from './communication';
import { Channels } from './config';

const TOKEN_PREFIX = 'iisy-token-';

function humanFileSize(bytes: number, si: boolean = true) {
  var thresh = si ? 1000 : 1024;
  if (Math.abs(bytes) < thresh) {
    return bytes + ' B';
  }
  var units = si
    ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  var u = -1;
  do {
    bytes /= thresh;
    ++u;
  } while (Math.abs(bytes) >= thresh && u < units.length - 1);
  return bytes.toFixed(1) + ' ' + units[u];
}

export class Filesystem {
  tmpPath: string;
  appPath: string;
  filePath: string;
  communication: Communication | undefined;
  constructor(app: App, communication?: Communication) {
    this.tmpPath = app.getPath('temp');
    this.appPath = app.getPath('userData') + '/';
    this.filePath = this.appPath + 'files/';
    const dirExist = existsSync(this.filePath);
    if (!dirExist) mkdirSync(this.filePath);

    this.communication = communication;
  }
  async openAsset(filename: string) {
    shell.openItem(join(this.filePath, filename));
  }
  removeTmpFile(tmpFilename: string) {
    return unlinkSync(this.getTmpFilePath(tmpFilename));
  }
  getTmpFile(tmpFilename: string): Buffer {
    return readFileSync(tmpFilename);
  }
  getTmpFilePath(tmpFilename: string) {
    return join(this.filePath, tmpFilename);
  }
  startTmpReadStream(tmpFilename: string) {
    return createReadStream(join(this.filePath, tmpFilename));
  }

  getFileSize(
    tmpFilename: string
  ): { readable: string; size: number; shouldTakeLong: boolean } {
    const stat = statSync(this.filePath + tmpFilename);

    return {
      readable: humanFileSize(stat.size),
      size: stat.size,
      shouldTakeLong: stat.size > 16000000
    };
  }

  saveTmpStream(stream: ReadStream, filename: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const path = this.filePath + filename;
      console.log(path);
      const writeStream = createWriteStream(path);

      stream.pipe(writeStream);

      stream.on('end', () => resolve(path));

      // writeStream.on('close', () => resolve(path));
      writeStream.on('finish', () => resolve(path));
      writeStream.on('error', err => reject(err));
      stream.on('error', () => reject);
    });
  }

  saveToken(token: string): string {
    const tmpFileName = TOKEN_PREFIX + v4();
    const path = this.tmpPath + tmpFileName;
    writeFileSync(path, token);

    return path;
  }
}
