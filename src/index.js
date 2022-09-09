import {
  urlToFilename,
  createPath,
  writeFile,
  get,
  processImages,
  loadImages,
  makeAssetsDir,
} from './utils.js';

const loadPage = async (url, outputDirpath = process.cwd()) => {
  const pageFilename = urlToFilename(url);
  const pageFilepath = createPath(outputDirpath, pageFilename);
  const html = await get(url);
  const [page, paths] = processImages(html, url);

  await makeAssetsDir(url, outputDirpath);
  await loadImages(paths, outputDirpath);
  await writeFile(pageFilepath, page);

  return pageFilename;
};

export default loadPage;
