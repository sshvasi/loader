import fs from 'fs/promises';
import { urlToDirname, buildPath } from './paths.js';

const writeFile = async (filepath, content) => {
  await fs.writeFile(filepath, content);
};

const makeAssetsDir = async (url, dest) => {
  const assetsDirname = urlToDirname(url);
  const assetsDirpath = buildPath(dest, assetsDirname);

  try {
    await fs.access(assetsDirpath);
  } catch {
    await fs.mkdir(assetsDirpath);
  }
};

export { writeFile, makeAssetsDir };
