#!/usr/bin/env node

import { Command } from 'commander';
import pageLoader from '../index.js';

const program = new Command();

const VERSION = '1.0.0';
const DESCRIPTION = 'Loads page and saves its content in dir.';

program
  .name('page-loader')
  .description(DESCRIPTION)
  .version(VERSION)
  .arguments('<url>')
  .option('-o, --output [dir]', 'output dir', process.cwd())
  .action((url) => {
    const { output } = program.opts();
    pageLoader(url, output)
      .then((filepath) => console.log(`Page was loaded to ${filepath}`))
      .catch((error) => {
        console.error(error.toString());
        console.log(error.message);
        process.exit(1);
      });
  });

program.parse(process.argv);
