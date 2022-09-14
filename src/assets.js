import cheerio from 'cheerio';
import prettier from 'prettier';
import { getUrl, load } from './url.js';
import { urlToDirname, urlToFilename, buildPath } from './paths.js';
import { writeFile } from './fs.js';

const processAssets = (markup, url) => {
  const { origin } = url;
  const $ = cheerio.load(markup);

  const assetTypes = {
    link: 'href',
    script: 'src',
    img: 'src',
  };

  const assetPaths = Object.entries(assetTypes).flatMap(([tag, attribute]) => {
    const assets = $(`${tag}[${attribute}]`).toArray();

    const localAssets = assets.filter((element) => {
      const sourcePath = $(element).attr(attribute);
      const assetUrl = getUrl(sourcePath, origin);

      return assetUrl.origin === origin;
    });

    const paths = localAssets.map((element) => {
      const sourcePath = $(element).attr(attribute);
      const assetUrl = getUrl(sourcePath, origin);

      const assetFilename = urlToFilename(assetUrl);
      const assetsDirname = urlToDirname(url);

      const relativePath = buildPath(assetsDirname, assetFilename);

      $(element).attr(attribute, relativePath);

      return { assetUrl, relativePath };
    });

    return paths;
  });

  const page = prettier.format($.html(), { parser: 'html' });

  return [page, assetPaths];
};

const loadAssets = async (paths, dest) => {
  const promises = paths.map(({ assetUrl, relativePath }) => {
    const absolutePath = buildPath(dest, relativePath);

    return load(assetUrl, { responseType: 'arraybuffer' })
      .then((data) => writeFile(absolutePath, data));
  });

  const assets = await Promise.all(promises);

  return assets;
};

export { processAssets, loadAssets };
