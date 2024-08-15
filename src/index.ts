import { createUnplugin } from "unplugin";
import type { UnpluginFactory } from "unplugin";
import type { Options } from "./types";

import { promises as fsPromises, existsSync } from "fs";
import { join, isAbsolute } from "path";
import JSZip from "jszip";

function timeZoneOffset(date: Date): Date {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000);
}

const DEFAULT_OPTIONS = {
  inDir: "dist",
  outDir: "dist-zip",
  outFileName: "dist.zip",
  pathPrefix: "",
  done: () => {},
  filter: () => true,
  enableLogging: true,
};

function logMessage(color: string, message: string) {
  console.log(`\x1b[${color}%s\x1b[0m`, message);
}

async function addFilesToZipArchive(
  zip: JSZip,
  inDir: string,
  filter: Function
) {
  const listOfFiles = await fsPromises.readdir(inDir);

  for (const fileName of listOfFiles) {
    const filePath = join(inDir, fileName);
    const file = await fsPromises.stat(filePath);
    const timeZoneOffsetDate = timeZoneOffset(new Date(file.mtime));

    if (file.isDirectory()) {
      if (!filter(fileName, filePath, true)) continue;
      zip.file(fileName, null, { dir: true, date: timeZoneOffsetDate });
      const dir = zip.folder(fileName);
      if (!dir)
        throw new Error(
          `fileName '${fileName}' couldn't get included as directory in the zip`
        );
      await addFilesToZipArchive(dir, filePath, filter);
    } else {
      if (filter(fileName, filePath, false)) {
        zip.file(fileName, await fsPromises.readFile(filePath), {
          date: timeZoneOffsetDate,
        });
      }
    }
  }
}

async function createZipArchive(
  zip: JSZip,
  outDir: string,
  outFileName: string,
  done: Function
) {
  // @ts-ignore
  zip.root = "";
  const file: Buffer = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 9 },
  });
  const fileName = join(outDir, outFileName);

  if (existsSync(fileName)) await fsPromises.unlink(fileName);
  await fsPromises.writeFile(fileName, new Uint8Array(file));
  done(undefined);
}

export const unpluginFactory: UnpluginFactory<Options | undefined> = (
  options
) => ({
  name: "unplugin-dist-zip-pack",
  buildEnd: async () => {
    const {
      inDir,
      outDir,
      outFileName,
      pathPrefix,
      done,
      filter,
      enableLogging,
    } = { ...DEFAULT_OPTIONS, ...options };
    let isCompress = false;

    process.on("beforeExit", async () => {
      if (isCompress) return;

      try {
        logMessage("36", `Zip packing - "${inDir}" folder :`);

        if (!existsSync(inDir))
          throw new Error(` - "${inDir}" folder does not exist!`);
        if (!existsSync(outDir))
          await fsPromises.mkdir(outDir, { recursive: true });
        if (pathPrefix && isAbsolute(pathPrefix))
          throw new Error('"pathPrefix" must be a relative path');

        const zip = new JSZip();
        const archive = pathPrefix ? zip.folder(pathPrefix) || zip : zip;

        if (enableLogging) logMessage("32", "  - Preparing files.");
        isCompress = true;
        await addFilesToZipArchive(archive, inDir, filter);

        if (enableLogging) logMessage("32", "  - Creating zip archive.");
        await createZipArchive(archive, outDir, outFileName, done);

        logMessage(
          "32",
          enableLogging ? "  - Done." : "  - Created zip archive."
        );
      } catch (error: any) {
        logMessage("31", `  - ${error}`);
        logMessage("31", "  - Something went wrong while building zip file!");
        done(error);
      }
    });
  },
});

export const unplugin = /* #__PURE__ */ createUnplugin(unpluginFactory);

export default unplugin;
