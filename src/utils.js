import path from 'path';
import fs from 'fs/promises';
import axios from 'axios';
import { load } from 'cheerio';
import { format } from 'prettier';

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
  await fs.mkdir(assetsDirpath);
};

const writeFile = (filepath, content) => fs.writeFile(filepath, content);

const getUrl = (url, base) => new URL(url, base);

const get = async (url, options = {}) => {
  const { href } = url;
  const { data } = await axios.get(href, options);

  return data;
};

const processImages = (markup, url) => {
  const { origin } = url;
  const assetsDirname = urlToDirname(url);

  const $ = load(markup);
  const images = $('img[src]').toArray();

  const paths = images.map((img) => {
    const sourcePath = $(img).attr('src');
    const imgUrl = getUrl(sourcePath, origin);
    const filename = urlToFilename(imgUrl);
    const relativePath = createPath(assetsDirname, filename);

    $(img).attr('src', relativePath);

    return { imgUrl, relativePath };
  });

  const page = format($.html(), { parser: 'html' });

  return [page, paths];
};

const loadImages = async (paths, dest) => {
  const promises = paths.map(({ imgUrl, relativePath }) => {
    const absolutePath = createPath(dest, relativePath);
    return get(imgUrl, { responseType: 'arraybuffer' }).then((data) =>
      writeFile(absolutePath, data)
    );
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
  processImages,
  loadImages,
};
