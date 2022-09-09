import url from 'url';
import os from 'os';
import path from 'path';
import fs from 'fs/promises';
import nock from 'nock';
import { urlToDirname, urlToFilename } from '../src/utils.js';
import pageLoader from '../index.js';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getFixturePath = (...paths) => path.join(__dirname, '..', '__fixtures__', ...paths);
const readFixtureFile = (dirname, filename) => fs.readFile(getFixturePath(dirname, filename), 'utf-8');

const BASE_URL = 'https://ru.hexlet.io';
const PAGE_PATH = '/courses';
const IMG_PATH = '/assets/professions/nodejs.png';

const pageUrl = new URL(PAGE_PATH, BASE_URL);
const imgUrl = new URL(IMG_PATH, BASE_URL);

const pageFilename = urlToFilename(pageUrl);
const imgFilename = urlToFilename(imgUrl);
const assetsDirname = urlToDirname(pageUrl);

let tmpDirpath;
let expectedFileContent;
let expectedImgContent;
let responseFileContent;

nock.disableNetConnect();

const scope = nock(BASE_URL).persist();

beforeAll(async () => {
  expectedFileContent = await readFixtureFile('expected', pageFilename);
  expectedImgContent = await readFixtureFile(
    path.join('expected', assetsDirname),
    imgFilename
  );
  responseFileContent = await readFixtureFile('.', pageFilename);

  scope.get(PAGE_PATH).reply(200, responseFileContent);
  scope.get(IMG_PATH).reply(200, expectedImgContent);
});

beforeEach(async () => {
  tmpDirpath = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
});

describe('pageLoader', () => {
  it('should create html file with correct name', async () => {
    const actualFilename = await pageLoader(pageUrl, tmpDirpath);
    expect(actualFilename).toBe(pageFilename);
  });

  it('should load page, make img src paths relative and save page in output dir', async () => {
    await pageLoader(pageUrl, tmpDirpath);

    const actualFileContent = await fs.readFile(
      path.join(tmpDirpath, pageFilename),
      'utf-8'
    );
    console.log(actualFileContent);
    expect(actualFileContent).toBe(expectedFileContent);
  });

  it('should load page images and <output_dir>_files dir', async () => {
    await pageLoader(pageUrl, tmpDirpath);

    const actualImageContent = await fs.readFile(
      path.join(tmpDirpath, assetsDirname, imgFilename),
      'utf-8'
    );
    expect(actualImageContent).toBe(expectedImgContent);
  });
});
