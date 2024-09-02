# unplugin-dist-zip-pack

将构建产物打包。
支持 Webpack、Vue-CLI、Vite、Rollup、esbuild、Astro、Nuxt、Rspack。支持对打包后的 zip 文件加密码。

Package the build products and support Webpack, Vue-CLI, Vite, Rollup, esbuild, Astro, Nuxt, and Rspack. Support adding passwords to the packaged zip files.

<p>
<a href="https://www.npmjs.com/package/unplugin-dist-zip-pack" target="_blank"><img src="https://img.shields.io/npm/v/unplugin-dist-zip-pack" /></a>
<a href="https://www.npmjs.com/package/unplugin-dist-zip-pack" target="_blank"><img src="https://img.shields.io/npm/dm/unplugin-dist-zip-pack" /></a>

</p>

## Install

```bash
npm i unplugin-dist-zip-pack
```

or

```bash
yarn add unplugin-dist-zip-pack
```

## Options

```bash
export interface Options {
  /**
   * Input Directory
   * @default `dist`
   */
  inDir?: string;
  /**
   * Output Directory
   * @default `dist-zip`
   */
  outDir?: string;
  /**
   * Zip Archive Name
   * @default `dist.zip`
   */
  outFileName?: string;
  /**
   * Path prefix for the files included in the zip file
   * @default ``
   */
  pathPrefix?: string;
  /**
   * Callback, which is executed after the zip file was created
   * err is only defined if the save function fails
   */
  done?: (err: Error | undefined) => void;
  /**
   * Filter function equivalent to Array.prototype.filter
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
   * is executed for every files and directories
   * files and directories are only included when return ist true.
   * All files are included when function is not defined
   */
  filter?: (
    fileName: string,
    filePath: string,
    isDirectory: boolean
  ) => boolean;
  /**
   * Password for the zip file
   * @default undefined
   */
  password?: string;
}
```

### Vite

```ts
// vite.config.ts
import zipPack from "unplugin-dist-zip-pack/vite";

export default defineConfig({
  plugins: [
    zipPack({
      /* options */
    }),
  ],
});
```

### Rollup

```ts
// rollup.config.js
import zipPack from "unplugin-dist-zip-pack/rollup";

export default {
  plugins: [
    zipPack({
      /* options */
    }),
  ],
};
```

### Webpack

```ts
// webpack.config.js
module.exports = {
  /* ... */
  plugins: [
    require("unplugin-dist-zip-pack/webpack")({
      /* options */
    }),
  ],
};
```

### Vue CLI

```ts
// vue.config.js
module.exports = {
  configureWebpack: {
    plugins: [
      require("unplugin-dist-zip-pack/webpack")({
        /* options */
      }),
    ],
  },
};
```

### esbuild

```ts
// esbuild.config.js
import { build } from "esbuild";
import zipPack from "unplugin-dist-zip-pack/esbuild";

build({
  plugins: [zipPack()],
});
```

### Nuxt

```ts
// nuxt.config.js
export default defineNuxtConfig({
  modules: [
    [
      "unplugin-dist-zip-pack/nuxt",
      {
        /* options */
      },
    ],
  ],
});
```

> This module works for both Nuxt 2 and [Nuxt Vite](https://github.com/nuxt/vite)

### Thanks

- [unplugin](https://github.com/unjs/unplugin)
- [zip.js](https://gildas-lormeau.github.io/zip.js/)
