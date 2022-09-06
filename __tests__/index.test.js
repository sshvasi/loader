import url from 'url';
import os from 'os';
import path from 'path';
import fs from 'fs/promises';
import nock from 'nock';
import { pageURLToName } from '../src/index.js';
import pageLoader from '../index.js';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getFixturePath = (...paths) => path.join(__dirname, '..', '__fixtures__', ...paths);
const readFixtureFile = (dirname, filename) => fs.readFile(getFixturePath(dirname, filename), 'utf-8');

const BASE_URL = 'https://ru.hexlet.io';
const PAGE_PATH = '/courses';
const PAGE_PATH_BEFORE = '/courses/before';
const IMG_PATH = '/assets/professions/nodejs';

const pageURL = new URL(PAGE_PATH, BASE_URL);
const pageURLBefore = new URL(PAGE_PATH_BEFORE, BASE_URL);
const imgURL = new URL(IMG_PATH, BASE_URL);

const filename = pageURLToName(pageURL);
const filenameBefore = pageURLToName(pageURLBefore);
const imgname = pageURLToName(imgURL, '.png');
const dirname = pageURLToName(pageURL, '_files');

let tmpDirpath;
let fileContent;
let fileContentBefore;
let imgContent;

nock.disableNetConnect();

beforeAll(async () => {
  fileContent = await readFixtureFile('.', filename);
  fileContentBefore = await readFixtureFile('.', filenameBefore);
  imgContent = await readFixtureFile(dirname, imgname);
});

beforeEach(async () => {
  tmpDirpath = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));

  nock(BASE_URL).get(PAGE_PATH_BEFORE).reply(200, fileContentBefore);
  nock(BASE_URL).get(PAGE_PATH).reply(200, fileContent);
});

describe('pageLoader', () => {
  it('should create html file with correct name', async () => {
    const actualFilename = await pageLoader(pageURL, tmpDirpath);
    expect(actualFilename).toBe(filename);
  });

  it('should download page and save it in output dir', async () => {
    await pageLoader(pageURL, tmpDirpath);

    const actualFileContent = await fs.readFile(path.join(tmpDirpath, filename), 'utf-8');
    expect(actualFileContent).toBe(fileContent);
  });

  it('should download page images and save they in <output_dir>_files dir', async () => {
    await pageLoader(pageURL, tmpDirpath);

    const actualImageContent = await fs.readFile(path.join(tmpDirpath, dirname, imgname), 'utf-8');
    expect(actualImageContent).toBe(imgContent);
  });

  it('should change link paths for resources after loading page', async () => {
    await pageLoader(pageURLBefore, tmpDirpath);

    const actualFileContent = await fs.readFile(path.join(tmpDirpath, filename), 'utf-8');
    expect(actualFileContent).toBe(fileContent);
  });
});
