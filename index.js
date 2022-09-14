import pageLoader from './src/index.js';

export default (url, outputDirpath = process.cwd()) => pageLoader(new URL(url), outputDirpath);
