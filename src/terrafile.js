#!/usr/bin/env node
const { Command, Option } = require("commander");

const backend = require("./backend");

version = require("../package.json").version;

function main(myargs, be) {
  const program = new Command();
  program
    .version(version, "-V, --version", "Show version information for terrafile")
    .description("Manage vendored modules using a JSON file.")
    .command("install")
    .description("Installs the files in your terrafile.json")
    .action((options) =>
      be === undefined ? backend.install(options) : be.install(options)
    )
    .addOption(
      new Option("-d, --directory <string>", "module directory").default(
        "vendor/modules"
      )
    )
    .addOption(
      new Option("-f, --file <string>", "config file").default("terrafile.json")
    );

  try {
    program.parse(myargs);
  } catch (err) {
    // swallow the error
  }
}

/* istanbul ignore if */
if (require.main === module) {
  main(process.argv);
} else {
  module.exports.main = main;
}
