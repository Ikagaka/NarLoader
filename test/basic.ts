/// <reference types="mocha" />
import * as JSZip from "jszip";
import * as assert from "power-assert";
import {NarLoader} from "../lib/NarLoader";

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
  it("#loadFromBuffer", async () => {
    const nar = new JSZip();
    nar.file("descript.txt", descript);
    const narData = await nar.generateAsync({type: "arraybuffer"});
    const dir = await NarLoader.loadFromBuffer(narData);
    assert(dir.new("descript.txt").isFileSync());
    const descriptInfo = dir.descriptInfoByTypeSync("ghost");
    assert(descriptInfo.shiori === "shiolink.dll");
  });
});
