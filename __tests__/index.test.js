import os from 'os';
import path from 'path';
import fs from 'fs/promises';
import nock from 'nock';
import pageLoader from '../index.js';

nock.disableNetConnect();

let tmpDirPath;

const baseUrl = 'https://ru.hexlet.io';
const pagePath = '/courses';
const pageUrl = new URL(pagePath, baseUrl);
const fileName = 'ru-hexlet-io-courses.html';
const fileContent = 'Каталог курсов по программированию на Хекслете';

beforeEach(async () => {
  tmpDirPath = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
});

test('pageLoad() download page and write its content in file', async () => {
  nock(baseUrl).get(pagePath).reply(200, fileContent);

  const actualFileName = await pageLoader(pageUrl, tmpDirPath);
  expect(actualFileName).toBe(fileName);

  const actualFileContent = await fs.readFile(path.resolve(tmpDirPath, fileName), 'utf-8');
  expect(actualFileContent).toBe(fileContent);
});
