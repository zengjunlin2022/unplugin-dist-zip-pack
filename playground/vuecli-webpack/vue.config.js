const { defineConfig } = require("@vue/cli-service");
const zipPack = require("../../dist/webpack.cjs");
module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: (config) => {
    let plugins = [
      // zip pack
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
    ];

    return {
      plugins: plugins,
    };
  },
});
