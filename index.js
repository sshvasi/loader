import { loadPage } from './src/index.js';

const pageLoader = (url, output = process.cwd()) => loadPage(new URL(url), output);

export default pageLoader;
