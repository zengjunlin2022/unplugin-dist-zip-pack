import { createUnplugin } from "unplugin";
import type { UnpluginFactory } from "unplugin";
import type { Options } from "./types";

import { promises as fsPromises, existsSync } from "fs";
import { join, isAbsolute, sep } from "path";

import * as zip from "@zip.js/zip.js";

const DEFAULT_OPTIONS = {
  inDir: "dist",
  outDir: "dist-zip",
  outFileName: "dist.zip",
  pathPrefix: "",
  done: () => {},
  filter: () => true,
  password: undefined,
};

async function addFilesToZipWriter(
  zipWriter: zip.ZipWriter<Blob>,
  inDir: string,
  pathPrefix: string,
  filter: Function
) {
  const listOfFiles = await fsPromises.readdir(inDir);

  for (const fileName of listOfFiles) {
    const filePath = join(inDir, fileName);
    const file = await fsPromises.stat(filePath);

    if (file.isDirectory()) {
      if (!filter(fileName, filePath, true)) continue;
      // 迭代下一級目錄
      await addFilesToZipWriter(zipWriter, filePath, pathPrefix, filter);
    } else {
      if (filter(fileName, filePath, false)) {
        const fileBuffer: Buffer = await fsPromises.readFile(filePath);
        const fileBlob = new Blob([fileBuffer], {
          type: zip.getMimeType(fileName),
        });
        let _filePath = removePathLevel(filePath, 0);
        let zipFilePath = pathPrefix ? join(pathPrefix, _filePath) : _filePath;
        zipWriter.add(zipFilePath, new zip.BlobReader(fileBlob));
      }
    }
  }
}
function removePathLevel(filePath: string, levelToRemove: number): string {
  // 将路径解析为各个部分
  const parts = filePath.split(sep);

  // 检查要删除的级别是否在有效范围内
  if (levelToRemove < 0 || levelToRemove >= parts.length) {
    throw new Error("Invalid level to remove");
  }

  // 删除指定级别的路径部分
  parts.splice(levelToRemove, 1);

  // 重新组合路径
  return parts.join(sep);
}

async function createZipFile(
  file: Blob,
  outDir: string,
  outFileName: string,
  done: Function
) {
  // Blob to ArrayBuffer
  const zipfile: ArrayBuffer = await file.arrayBuffer();
  const fileName = join(outDir, outFileName);

  if (existsSync(fileName)) await fsPromises.unlink(fileName);
  await fsPromises.writeFile(fileName, new Uint8Array(zipfile));
  done(undefined);
}

export const unpluginFactory: UnpluginFactory<Options | undefined> = (
  options
) => ({
  name: "unplugin-dist-zip-pack",
  buildEnd: async () => {
    const { inDir, outDir, outFileName, pathPrefix, done, filter, password } = {
      ...DEFAULT_OPTIONS,
      ...options,
    };
    let isCompress = false;

    process.on("beforeExit", async () => {
      if (isCompress) return;

      try {
        console.log(`Zip packing - "${inDir}" folder`);

        if (!existsSync(inDir))
          throw new Error(` - "${inDir}" folder does not exist!`);
        if (!existsSync(outDir))
          await fsPromises.mkdir(outDir, { recursive: true });
        if (pathPrefix && isAbsolute(pathPrefix))
          throw new Error('"pathPrefix" must be a relative path');

        let zipWriterOpts: zip.ZipWriterConstructorOptions = {};
        if (password) {
          zipWriterOpts.password = password;
        }
        const zipWriter: zip.ZipWriter<Blob> = new zip.ZipWriter(
          new zip.BlobWriter("application/zip"),
          zipWriterOpts
        );
        isCompress = true;

        // 遍歷目錄
        await addFilesToZipWriter(zipWriter, inDir, pathPrefix, filter);
        let result = await zipWriter.close();
        console.log("Creating zip archive.");
        await createZipFile(result, outDir, outFileName, done);
        console.log("Zip packing done.");
      } catch (error: any) {
        console.error(`Zip packing failed.`);
        console.error(`${error}`);
        done(error);
      }
    });
  },
});

export const unplugin = /* #__PURE__ */ createUnplugin(unpluginFactory);

export default unplugin;
