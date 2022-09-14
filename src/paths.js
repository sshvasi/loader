import path from 'path';

const buildPath = (dirpath, filename) => path.join(dirpath, filename);

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

export {
  buildPath,
  formatName,
  parseUrl,
  urlToDirname,
  urlToFilename,
};
