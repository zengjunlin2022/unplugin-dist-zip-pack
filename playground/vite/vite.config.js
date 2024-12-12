import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
// zip pack
import zipPack from "../../dist/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // zip pack -- pack assets folder to zip
    zipPack({
      inDir: `./dist/assets`,
      outDir: `./distpack`,
      outFileName: `dist_${new Date().getTime()}.zip`,
      filter: (fileName, filePath, isDirectory) => {
        // config目錄以及config目錄下的文件不打包
        if (filePath.includes("config")) {
          return false;
        }
        return true;
      },
      subDirAsRoot: "./dist/assets",
    }),

    /**
     * default zip pack -- pack dist folder to zip
     */
    /*
    zipPack({
      inDir: `./dist`,
      outDir: `./distpack`,
      outFileName: `dist_${new Date().getTime()}.zip`,
      filter: (fileName, filePath, isDirectory) => {
        // config目錄以及config目錄下的文件不打包
        if (filePath.includes("config")) {
          return false;
        }
        return true;
      },
    }),
    */
  ],
});
