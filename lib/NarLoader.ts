/// <reference types="node" />

/** Nanika ARchive Loader */

import * as fs from "fs";
import {FileSystemObject} from "fso";
import * as JSZip from "jszip";
import {
  NanikaContainerSyncDirectory,
  NanikaContainerSyncFile,
} from "nanika-storage";
import * as path from "path";

/**
 * load nar from path
 * @param narPath nar file path
 */
export async function loadFromPath(narPath: string) {
  const buffer = (await new FileSystemObject(narPath).readFile());
  return loadFromBuffer(buffer);
}

/**
 * load nar from URI
 * @param narUri nar file URI
 */
export async function loadFromURI(narUri: URL | string) {
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
    xhr.open("GET", narUri as string);
    xhr.send();
  });
  return loadFromBuffer(buffer);
}

/**
 * load nar from buffer
 * @param nar nar file buffer
 */
export async function loadFromBuffer(nar: string | ArrayBuffer | Uint8Array | Buffer | Blob) {
  const zip = new JSZip();
  await zip.loadAsync(nar, {createFolders: true});
  const entries: JSZip.JSZipObject[] = [];
  zip.forEach((_, entry) => entries.push(entry));
  const children = await Promise.all(entries.map(async (entry) => {
    const content = await entry.async("nodebuffer") as Buffer;
    const stats = new NarLoaderStats(entry, content.byteLength);
    const name = path.normalize(entry.dir ? entry.name.replace(/[\\\/]$/, "") : entry.name);
    return new NanikaContainerSyncFile(name, content, stats);
  }));
  const dir = new NanikaContainerSyncDirectory("", children);
  // トップレベルがフォルダになっているZIP対策
  if (!dir.new("install.txt").existsSync() &&
    dir.childrenAllSync().find(child => child.basename().path === "install.txt")) {
    const installTxt = dir.childrenAllSync().find((entry) => entry.basename().toString() === "install.txt");
    if (installTxt) {
      return dir.new(installTxt.dirname().toString()) as NanikaContainerSyncDirectory;
    }
  }
  return dir;
}

const S_IFREG = 0o100000;
const S_IFDIR = 0o40000;

/** emulate node.js stats */
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
  atimeMs: number;
  mtimeMs: number;
  ctimeMs: number;
  birthtimeMs: number;
  atime: Date;
  mtime: Date;
  ctime: Date;
  birthtime: Date;

  constructor(entry: JSZip.JSZipObject, size: number) {
    const unixPermissions = ((entry as any).unixPermissions as number | undefined) || (entry.dir ? 0x755 : 0x644);
    this.mode = (entry.dir ? S_IFDIR : S_IFREG) | unixPermissions;
    this.size = size;
    const date = entry.date;
    this.atime = date;
    this.mtime = date;
    this.ctime = date;
    this.birthtime = date;
    const ms = date.getTime();
    this.atimeMs = ms;
    this.mtimeMs = ms;
    this.ctimeMs = ms;
    this.birthtimeMs = ms;
  }

  isFile() { return Boolean(this.mode & S_IFREG); }
  isDirectory() { return Boolean(this.mode & S_IFDIR); }
  isBlockDevice() { return false; }
  isCharacterDevice() { return false; }
  isSymbolicLink() { return false; }
  isFIFO() { return false; }
  isSocket() { return false; }
}
