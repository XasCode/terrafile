#!/usr/bin/env node

const { printMsg } = require('./include.js');

const { Command } = require('commander');
const program = new Command();
program
  .version('0.1.0-alpha.1')
  .command('run')
  .description('test run')
  .action((source, destinatin) => {
    console.log("Hello World!");
    printMsg();
  });

program.parse(process.argv);
