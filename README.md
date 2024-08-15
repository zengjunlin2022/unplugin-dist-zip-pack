# unplugin-dist-zip-pack

<p align='center'>
  <a href="https://www.npmjs.com/package/unplugin-dist-zip-pack"><img src="https://img.shields.io/npm/v/unplugin-dist-zip-pack" /></a>
  <a href="https://www.npmjs.com/package/unplugin-dist-zip-pack"><img src="https://img.shields.io/npm/dm/unplugin-dist-zip-pack" /></a>
</p>

<br />
<p align='center'><i>powered by <a href="https://github.com/unjs/unplugin" target="_blank">unplugin</a></i></p>
<br />
<p>
  Thanks <a href="https://github.com/7th-Cyborg/vite-plugin-zip-pack">7th-Cyborg/vite-plugin-zip-pack</a>
</p>

## Install

```bash
npm i unplugin-dist-zip-pack
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
  done?: (err: Error | undefined) => void
  /**
   * Filter function equivalent to Array.prototype.filter
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
   * is executed for every files and directories
   * files and directories are only included when return ist true.
   * All files are included when function is not defined
   */
  filter?: (fileName: string, filePath: string, isDirectory: boolean) => Boolean
  /**
   * Enable logging
   * @default true
   */
  enableLogging?: boolean;
}
```

<details>
<summary>Vite</summary><br>

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

<br></details>

<details>
<summary>Rollup</summary><br>

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

<br></details>

<details>
<summary>Webpack</summary><br>

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

<br></details>

<details>
<summary>Vue CLI</summary><br>

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

<br></details>

<details>
<summary>esbuild</summary><br>

```ts
// esbuild.config.js
import { build } from "esbuild";
import zipPack from "unplugin-dist-zip-pack/esbuild";

build({
  plugins: [zipPack()],
});
```

<br></details>
