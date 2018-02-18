NarLoader - Nanika ARchive Loader
==========================

[![Greenkeeper badge](https://badges.greenkeeper.io/Ikagaka/NarLoader.svg)](https://greenkeeper.io/)

[Nanika ARchive](http://usada.sakura.vg/contents/install.html) (*.nar) loader

Installation
--------------------------

```
npm install narloader
```

Usage
--------------------------

```typescript
import {NarLoader} from "narloader";
const buffer = (nar data ArrayBuffer);
NarLoader.loadFromBuffer(buffer).then((directory) => ...);
```

### on browser

You can bundle NarLoader by webpack / browserify with [BrowserFS](https://github.com/jvilk/BrowserFS#using-with-browserify-and-webpack)' instruction.

API
--------------------------

```typescript
/** Nanika ARchive Loader */
export class NarLoader {
  /**
   * load nar from path
   * @param narPath nar file path
   */
  static async loadFromPath(narPath: string): Promise<NanikaContainerSyncDirectory>;

  /**
   * load nar from URI
   * @param narUri nar file URI
   */
  static async loadFromURI(narUri: URL | string): Promise<NanikaContainerSyncDirectory>;

  /**
   * load nar from buffer
   * @param nar nar file buffer
   */
  static async loadFromBuffer(nar: string | ArrayBuffer | Uint8Array | Buffer | Blob): Promise<NanikaContainerSyncDirectory>;
}
```

License
--------------------------

This is released under [MIT License](http://narazaka.net/license/MIT?2018).
