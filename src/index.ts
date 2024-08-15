import type { UnpluginFactory } from "unplugin";
import { createUnplugin } from "unplugin";
import type { Options } from "./types";

import fs from "fs";
import path from "path";
import JSZip from "jszip";

function timeZoneOffset(date: Date): Date {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000);
}

export const unpluginFactory: UnpluginFactory<Options | undefined> = (
  options
) => ({
  name: "unplugin-dist-zip-pack",
  buildEnd: async () => {
    const inDir = options?.inDir || "dist";
    const outDir = options?.outDir || "dist-zip";
    const outFileName = options?.outFileName || "dist.zip";
    const pathPrefix = options?.pathPrefix || "";
    const done = options?.done || function () {};
    const filter = options?.filter || (() => true);
    const { enableLogging = true } = options || {};

    async function addFilesToZipArchive(zip: JSZip, inDir: string) {
      const listOfFiles = await fs.promises.readdir(inDir);

      for (const fileName of listOfFiles) {
        const filePath = path.join(inDir, fileName);
        const file = await fs.promises.stat(filePath);
        const timeZoneOffsetDate = timeZoneOffset(new Date(file.mtime));

        if (file.isDirectory()) {
          if (!filter(fileName, filePath, true)) {
            continue;
          }
          zip.file(fileName, null, {
            dir: true,
            date: timeZoneOffsetDate,
          });
          const dir = zip.folder(fileName);
          if (!dir) {
            throw new Error(
              `fileName '${fileName}' couldn't get included als directory in the zip`
            );
          }

          await addFilesToZipArchive(dir, filePath);
        } else {
          if (filter(fileName, filePath, false)) {
            zip.file(fileName, await fs.promises.readFile(filePath), {
              date: timeZoneOffsetDate,
            });
          }
        }
      }
    }

    async function createZipArchive(zip: JSZip) {
      // @ts-ignore
      zip.root = "";

      const file: Buffer = await zip.generateAsync({
        type: "nodebuffer",
        compression: "DEFLATE",
        compressionOptions: {
          level: 9,
        },
      });

      const fileName = path.join(outDir, outFileName);

      if (fs.existsSync(fileName)) {
        await fs.promises.unlink(fileName);
      }
      await fs.promises.writeFile(fileName, new Uint8Array(file));
      done(undefined);
    }

    let isCompress: boolean = false;
    process.on("beforeExit", async () => {
      if (isCompress) return;

      try {
        console.log("\x1b[36m%s\x1b[0m", `Zip packing - "${inDir}" folder :`);

        if (!fs.existsSync(inDir)) {
          throw new Error(` - "${inDir}" folder does not exist!`);
        }

        if (!fs.existsSync(outDir)) {
          await fs.promises.mkdir(outDir, { recursive: true });
        }

        if (pathPrefix && path.isAbsolute(pathPrefix)) {
          throw new Error('"pathPrefix" must be a relative path');
        }

        const zip = new JSZip();
        let archive: JSZip;

        if (pathPrefix) {
          const timeZoneOffsetDate = timeZoneOffset(new Date());

          zip.file(pathPrefix, null, {
            dir: true,
            date: timeZoneOffsetDate,
          });
          const zipFolder = zip.folder(pathPrefix);

          if (!zipFolder)
            throw new Error("Files could not be loaded from 'pathPrefix'");

          archive = zipFolder!;
        } else {
          archive = zip;
        }

        if (enableLogging) {
          console.log("\x1b[32m%s\x1b[0m", "  - Preparing files.");
        }
        isCompress = true;
        await addFilesToZipArchive(archive, inDir);

        if (enableLogging) {
          console.log("\x1b[32m%s\x1b[0m", "  - Creating zip archive.");
        }

        await createZipArchive(archive);

        if (enableLogging) {
          console.log("\x1b[32m%s\x1b[0m", "  - Done.");
        } else {
          console.log("\x1b[32m%s\x1b[0m", "  - Created zip archive.");
        }
      } catch (error: any) {
        if (error) {
          console.log("\x1b[31m%s\x1b[0m", `  - ${error}`);
        }

        console.log(
          "\x1b[31m%s\x1b[0m",
          "  - Something went wrong while building zip file!"
        );
        done(error);
      }
    });
  },
});

export const unplugin = /* #__PURE__ */ createUnplugin(unpluginFactory);

export default unplugin;
