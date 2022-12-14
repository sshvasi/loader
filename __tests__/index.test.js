import url from 'url';
import os from 'os';
import path from 'path';
import fs from 'fs/promises';
import nock from 'nock';
import { urlToDirname, urlToFilename, buildPath } from '../src/paths.js';
import pageLoader from '../index.js';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getFixturePath = (...paths) => path.join(__dirname, '..', '__fixtures__', ...paths);
const readFixtureFile = (dirname, filename) => fs.readFile(getFixturePath(dirname, filename), 'utf-8');

const BASE_URL = 'https://ru.hexlet.io';
const PAGE_PATH = '/courses';

const pageUrl = new URL(PAGE_PATH, BASE_URL);

const pageFilename = urlToFilename(pageUrl);
const assetsDirname = urlToDirname(pageUrl);

const assetsInfo = [
  {
    format: 'png',
    urlPath: '/assets/professions/nodejs.png',
    filepath: buildPath(assetsDirname, 'ru-hexlet-io-assets-professions-nodejs.png'),
  },
  {
    format: 'css',
    urlPath: '/assets/application.css',
    filepath: buildPath(assetsDirname, 'ru-hexlet-io-assets-application.css'),
  },
  {
    format: 'js',
    urlPath: '/packs/js/runtime.js',
    filepath: buildPath(assetsDirname, 'ru-hexlet-io-packs-js-runtime.js'),
  },
];
const formats = assetsInfo.map(({ format }) => format);
const scope = nock(BASE_URL).persist();

let tmpDirpath;
let resources;

nock.disableNetConnect();

beforeAll(async () => {
  tmpDirpath = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));

  const addContent = (info) => readFixtureFile('expected', info.filepath).then((content) => ({ ...info, content }));
  const promises = assetsInfo.map(addContent);

  resources = await Promise.all(promises);
  resources.forEach(({ urlPath, content }) => scope.get(urlPath).reply(200, content));

  const rawFileContent = await readFixtureFile('.', pageFilename);
  scope.get(PAGE_PATH).reply(200, rawFileContent);
});

describe('pageLoader', () => {
  test('should create html file with correct name', async () => {
    const actualFilepath = await pageLoader(pageUrl, tmpDirpath);
    const expectedFilepath = buildPath(tmpDirpath, pageFilename);

    expect(actualFilepath).toBe(expectedFilepath);
  });

  test('should load page in output dir and make resource paths relative', async () => {
    await pageLoader(pageUrl, tmpDirpath);

    const actualFileContent = await fs.readFile(path.join(tmpDirpath, pageFilename), 'utf-8');
    const expectedFileContent = await readFixtureFile('expected', pageFilename);

    expect(actualFileContent).toBe(expectedFileContent);
  });

  test.each(formats)(
    'should load %s-resourse in <output_dir>_files dir',
    async (format) => {
      const { filepath, content } = resources.find((resource) => resource.format === format);
      const actualFileContent = await fs.readFile(path.join(tmpDirpath, filepath), 'utf-8');

      expect(actualFileContent).toBe(content);
    },
  );

  test('should throw error if url is invalid', async () => {
    const invalidBaseUrl = BASE_URL.replace('x', '');
    const expectedError = `getaddrinfo ENOTFOUND ${invalidBaseUrl}`;

    nock(invalidBaseUrl).persist().get('/').replyWithError(expectedError);

    await expect(pageLoader(invalidBaseUrl, tmpDirpath)).rejects.toThrow(expectedError);
  });

  test.each([404, 500])(
    'should be able to fail request with status code %s',
    async (code) => {
      scope.get(`/${code}`).reply(code, '');

      const testUrl = new URL(`/${code}`, BASE_URL).href;

      await expect(pageLoader(testUrl, tmpDirpath))
        .rejects.toThrow(`Request failed with status code ${code}`);
    },
  );

  test('shoult be able to throw file system errors', async () => {
    const rootDirpath = '/sys';
    const testUrl = pageUrl.href;

    await expect(pageLoader(testUrl, rootDirpath))
      .rejects.toThrow(`EACCES: permission denied, open '${rootDirpath}/${pageFilename}'`);

    const filepath = getFixturePath(pageFilename);
    await expect(pageLoader(testUrl, filepath))
      .rejects.toThrow(`ENOTDIR: not a directory, open '${filepath}/${pageFilename}'`);

    const notExistingPath = getFixturePath('notExistsPath');
    await expect(pageLoader(testUrl, notExistingPath))
      .rejects.toThrow(`ENOENT: no such file or directory, open '${notExistingPath}/${pageFilename}'`);
  });
});
