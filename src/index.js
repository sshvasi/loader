import path from 'path';
import fs from 'fs/promises';
import axios from 'axios';

const urlToFilename = (url, postfix = '.html') => {
  const { hostname, pathname } = url;
  const filename = `${hostname}${pathname}`.replace(/\W/g, '-');

  return `${filename}${postfix}`;
};

const writeFile = (dirpath, filename, content) => {
  const filepath = path.resolve(dirpath, filename);

  return fs.writeFile(filepath, content);
};

const loadPage = (url, dirpath = process.cwd()) => {
  const { href } = url;
  const filename = urlToFilename(url);

  return axios.get(href)
    .then(({ data }) => writeFile(dirpath, filename, data))
    .then(() => filename);
};

export default loadPage;
