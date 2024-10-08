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
