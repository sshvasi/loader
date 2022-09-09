import {
  urlToFilename,
  createPath,
  writeFile,
  get,
  processAssets,
  loadAssets,
  makeAssetsDir,
} from './utils.js';

const loadPage = async (url, outputDirpath = process.cwd()) => {
  const pageFilename = urlToFilename(url);
  const pageFilepath = createPath(outputDirpath, pageFilename);

  const html = await get(url);

  const [page, assetPaths] = processAssets(html, url);

  await makeAssetsDir(url, outputDirpath);
  await loadAssets(assetPaths, outputDirpath);
  await writeFile(pageFilepath, page);

  return pageFilename;
};

export default loadPage;
