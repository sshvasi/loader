import { load } from './url.js';
import { urlToFilename, buildPath } from './paths.js';
import { writeFile, makeAssetsDir } from './fs.js';
import { processAssets, loadAssets } from './assets.js';

const pageLoader = async (url, outputDirpath = process.cwd()) => {
  const pageFilename = urlToFilename(url);
  const pageFilepath = buildPath(outputDirpath, pageFilename);

  const html = await load(url);
  const [page, assetPaths] = processAssets(html, url);

  await writeFile(pageFilepath, page);

  await makeAssetsDir(url, outputDirpath);
  await loadAssets(assetPaths, outputDirpath);

  return pageFilename;
};

export default pageLoader;
