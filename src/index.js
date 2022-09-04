import path from 'path';
import fs from 'fs/promises';
import axios from 'axios';

const urlToFilename = (url, postfix) => {
  const { hostname, pathname } = url;
  const filename = `${hostname}${pathname}`
    .match(/\w*/gi)
    .filter((w) => w)
    .join('-');

  return `${filename}${postfix}`;
};

const writeFile = (dirpath, filename, content) => {
  const filepath = path.resolve(dirpath, filename);
  fs.writeFile(filepath, content);
};

const pageLoader = (url, dirpath = process.cwd()) => axios.get(url.toString())
  .then(({ data }) => {
    const filename = urlToFilename(url, '.html');
    writeFile(dirpath, filename, data);

    return filename;
  })
  .then((filename) => filename);

export default pageLoader;
