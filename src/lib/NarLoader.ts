/// <reference types="node" />

import * as fs from "fs";
import {FileSystemObject} from "fso";
import * as JSZip from "jszip";
import {
  NanikaContainerSyncDirectory,
  NanikaContainerSyncFile,
} from "nanika-storage";
import * as path from "path";

/** Nanika ARchive Loader */
export class NarLoader {
  /**
   * load nar from path
   * @param narPath nar file path
   */
  static async loadFromPath(narPath: string) {
    const buffer = (await new FileSystemObject(narPath).readFile());
    return NarLoader.loadFromBuffer(buffer);
  }

  /**
   * load nar from URI
   * @param narUri nar file URI
   */
  static async loadFromURI(narUri: URL | string) {
    const buffer = await new Promise<ArrayBuffer>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = () => {
        if (200 <= xhr.status && xhr.status < 300) {
          resolve(xhr.response);
        } else {
          reject(xhr.statusText);
        }
      };
      xhr.onerror = (error) => reject(error);
      xhr.responseType = "arraybuffer";
      xhr.open("GET", <string> narUri);
      xhr.send();
    });
    return NarLoader.loadFromBuffer(buffer);
  }

  /**
   * load nar from buffer
   * @param nar nar file buffer
   */
  static async loadFromBuffer(nar: string | ArrayBuffer | Uint8Array | Buffer | Blob) {
    const zip = new JSZip();
    await zip.loadAsync(nar, {createFolders: true});
    const entries: JSZipObject[] = [];
    zip.forEach((_, entry) => entries.push(entry));
    const children = await Promise.all(entries.map(async (entry) => {
      const content = <Buffer> await entry.async("nodebuffer");
      const stats = new NarLoaderStats(entry, content.byteLength);
      return new NanikaContainerSyncFile(path.normalize(entry.name), content, stats);
    }));
    const dir = new NanikaContainerSyncDirectory("", children);
    // トップレベルがフォルダになっているZIP対策
    if (dir.new("install.txt").existsSync()) {
      const installTxt = dir.childrenAllSync().find((entry) => entry.basename().toString() === "install.txt");
      if (installTxt) {
        return <NanikaContainerSyncDirectory> dir.new(installTxt.dirname().toString());
      }
    }
    return dir;
  }
}

const S_IFREG = 0o100000;
const S_IFDIR = 0o40000;

export class NarLoaderStats implements fs.Stats {
  dev = 0;
  ino = 0;
  mode: number;
  nlink = 0;
  uid = 0;
  gid = 0;
  rdev = 0;
  size: number;
  blksize = 0;
  blocks = 0;
  atime: Date;
  mtime: Date;
  ctime: Date;
  birthtime: Date;

  constructor(entry: JSZipObject, size: number) {
    const unixPermissions = (<number | undefined> (<any> entry).unixPermissions) || (entry.dir ? 0x755 : 0x644);
    this.mode = (entry.dir ? S_IFDIR : S_IFREG) | unixPermissions;
    this.size = size;
    this.atime = entry.date;
    this.mtime = entry.date;
    this.ctime = entry.date;
    this.birthtime = entry.date;
  }

  isFile() { return Boolean(this.mode & S_IFREG); }
  isDirectory() { return Boolean(this.mode & S_IFDIR); }
  isBlockDevice() { return false; }
  isCharacterDevice() { return false; }
  isSymbolicLink() { return false; }
  isFIFO() { return false; }
  isSocket() { return false; }
}
