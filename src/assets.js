import cheerio from 'cheerio';
import prettier from 'prettier';
import Listr from 'listr';
import debug from 'debug';
import { getUrl, load } from './url.js';
import { urlToDirname, urlToFilename, buildPath } from './paths.js';
import { writeFile } from './fs.js';

const log = debug('page-loader');

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

  log('Replace asset source paths with relative paths.');

  const page = prettier.format($.html(), { parser: 'html' });

  return [page, assetPaths];
};

const loadAssets = async (paths, dest) => {
  const promises = paths.map(({ assetUrl, relativePath }) => {
    const { href } = assetUrl;
    const absolutePath = buildPath(dest, relativePath);

    return {
      title: href,
      task: () => load(assetUrl, { responseType: 'arraybuffer' }).then((data) => writeFile(absolutePath, data)),
    };
  });

  const tasks = new Listr(promises, { concurrent: true, renderer: 'progressBar' });

  log('Load assets', { count: paths.length });

  return tasks.run();
};

export { processAssets, loadAssets };
