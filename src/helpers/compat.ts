import * as path from 'path';
import * as tmp from 'tmp-promise';
import * as fs from 'fs/promises';
import { info, logError, UploadLogger, verbose } from './logger'
import { runExternalProgram } from './util'

const bashLocation = path.join(__dirname, '../../../assets/bash')

export const MAGIC_LINE = "==!!==!!==&CODECOVDRYRUNSEPARATOR";

export async function getBashScriptResult(): Promise<string | undefined> {
  const {path, cleanup} = await tmp.file({mode: 0o700});
  try {
    const fileBuffer = await fs.readFile(bashLocation);
    await fs.writeFile(path, fileBuffer);
    return runExternalProgram(path, ["-d"]).split(MAGIC_LINE, 2)[1]?.trim();
  } catch (error) {
    logError("Unable to run bash script");
    return "";
  } finally {
    cleanup();
  }
}

export const compatibilityDivider = '\n' + '==FROMNOWONIGNOREDBYCODECOV==>>>' + '\n'
