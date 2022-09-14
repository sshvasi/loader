import debug from 'debug';
import { load } from './url.js';
import { urlToFilename, buildPath } from './paths.js';
import { writeFile, makeAssetsDir } from './fs.js';
import { processAssets, loadAssets } from './assets.js';

const log = debug('page-loader');

const pageLoader = async (url, outputDirpath = process.cwd()) => {
  const pageFilename = urlToFilename(url, '.html');
  log(`Generate file name: ${pageFilename}.`);

  const pageFilepath = buildPath(outputDirpath, pageFilename);
  log(`Generate file path: ${pageFilepath}.`);

  const html = await load(url);
  const [page, assetPaths] = processAssets(html, url);

  await writeFile(pageFilepath, page);

  await makeAssetsDir(url, outputDirpath);
  await loadAssets(assetPaths, outputDirpath);

  return pageFilepath;
};

export default pageLoader;
