import path from 'path';
import fs from 'fs/promises';
import axios from 'axios';
import cheerio from 'cheerio';
import prettier from 'prettier';

const formatName = (name, replacer = '-') => name.replace(/\W/g, replacer);

const parseUrl = (url) => {
  const { hostname, pathname } = url;

  return path.parse(`${hostname}${pathname}`);
};

const urlToDirname = (url, postfix = '_files') => {
  const { dir, name, ext } = parseUrl(url);
  const dirname = formatName(path.join(dir, name, ext));

  return `${dirname}${postfix}`;
};

const urlToFilename = (url, format = '.html') => {
  const { dir, name, ext } = parseUrl(url);
  const filename = formatName(path.join(dir, name));
  const postfix = ext || format;

  return `${filename}${postfix}`;
};

const createPath = (dirpath, filename) => path.join(dirpath, filename);

const makeAssetsDir = async (url, dest) => {
  const assetsDirname = urlToDirname(url);
  const assetsDirpath = createPath(dest, assetsDirname);

  try {
    await fs.access(assetsDirpath);
  } catch {
    await fs.mkdir(assetsDirpath);
  }
};

const writeFile = (filepath, content) => fs.writeFile(filepath, content);

const getUrl = (url, base) => new URL(url, base);

const get = async (url, options = {}) => {
  const { href } = url;
  const { data } = await axios.get(href, options);

  return data;
};

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
      const filename = urlToFilename(assetUrl);
      const assetsDirname = urlToDirname(url);
      const relativePath = createPath(assetsDirname, filename);

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
    const absolutePath = createPath(dest, relativePath);
    return get(assetUrl, { responseType: 'arraybuffer' })
      .then((data) => writeFile(absolutePath, data));
  });
  const results = await Promise.all(promises);

  return results;
};

export {
  urlToDirname,
  urlToFilename,
  createPath,
  makeAssetsDir,
  writeFile,
  getUrl,
  get,
  processAssets,
  loadAssets,
};
