/// <reference types="mocha" />
import * as JSZip from "jszip";
import * as assert from "power-assert";
import * as NarLoader from "../lib/NarLoader";

const install = `
type,ghost
name,いかがでしょうか？
directory,ikaga
`;

const descript = `
charset,UTF-8
type,ghost
name,さっちゃんさん
sakura.name,さっちゃんさん
kero.name,友人A
homeurl,https://example.com/

craftman,Narazaka
craftmanw,奈良阪
craftmanurl,https://narazaka.net/

shiori,shiolink.dll

invalid line
// コメント

`;

describe("NarLoader", () => {
  describe("#loadFromBuffer", () => {
    context("no install", () => {
      it("works", async () => {
        const nar = new JSZip();
        nar.file("descript.txt", descript);
        const narData = await nar.generateAsync({type: "arraybuffer"});
        const dir = await NarLoader.loadFromBuffer(narData);
        assert(dir.new("descript.txt").isFileSync());
        const descriptInfo = dir.descriptInfoByTypeSync("ghost");
        assert(descriptInfo.shiori === "shiolink.dll");
      });
    });

    context("has install", () => {
      it("works", async () => {
        const nar = new JSZip();
        nar.file("install.txt", install);
        nar.file("descript.txt", descript);
        const narData = await nar.generateAsync({type: "arraybuffer"});
        const dir = await NarLoader.loadFromBuffer(narData);
        assert(dir.new("descript.txt").isFileSync());
        const installInfo = dir.installInfoSync();
        assert(installInfo.type === "ghost");
        const descriptInfo = dir.descriptInfoByTypeSync("ghost");
        assert(descriptInfo.shiori === "shiolink.dll");
      });
    });

    context("has install and top level directory", () => {
      it("works", async () => {
        const nar = new JSZip();
        nar.folder("ikaga").file("install.txt", install);
        nar.folder("ikaga").file("descript.txt", descript);
        const narData = await nar.generateAsync({type: "arraybuffer"});
        const dir = await NarLoader.loadFromBuffer(narData);
        assert(dir.new("descript.txt").isFileSync());
        const installInfo = dir.installInfoSync();
        assert(installInfo.type === "ghost");
        const descriptInfo = dir.descriptInfoByTypeSync("ghost");
        assert(descriptInfo.shiori === "shiolink.dll");
      });
    });
  });
});
