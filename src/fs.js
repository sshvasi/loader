import fs from 'fs/promises';
import debug from 'debug';
import { urlToDirname, buildPath } from './paths.js';

const log = debug('page-loader');

const writeFile = async (filepath, content) => {
  await fs.writeFile(filepath, content);
};

const makeAssetsDir = async (url, dest) => {
  const assetsDirname = urlToDirname(url);
  const assetsDirpath = buildPath(dest, assetsDirname);

  log(`Make dir for assets: ${assetsDirpath}.`);

  try {
    await fs.access(assetsDirpath);
  } catch {
    await fs.mkdir(assetsDirpath);
  }
};

export { writeFile, makeAssetsDir };
