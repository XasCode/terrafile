#!/usr/bin/env node

const { Command } = require('commander');
const program = new Command();
program
  .version('0.1.0-alpha.1')
  .command('run')
  .description('test run')
  .action((source, destinatin) => {
    const backend = `${process.env.terrafile_be_api ? process.env.terrafile_be_api : './include'}`;
    const { printMsg } = require(backend);
    console.log("Hello World!");
    printMsg();
  });

program.parse(process.argv);
