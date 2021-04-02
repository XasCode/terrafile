#!/usr/bin/env node

function main(myargs, be) {
  const { Command, Option } = require("commander");

  const program = new Command();
  program
    .version(
      require("./package.json").version,
      "-V, --version",
      "Show version information for terrafile"
    )
    .description(`Manage vendored modules using a JSON file.`);

  program
    .command("install")
    .description("Installs the files in your terrafile.json")
    .action((options) => {
      const backend =
        be == undefined || be == ""
          ? `${
              process.env.terrafile_be_api
                ? process.env.terrafile_be_api
                : "./include"
            }`
          : be;
      const { install } = require(backend);
      install(options);
    })
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
    console.log(JSON.stringify(err));
  }
}

if (require.main === module) {
  main(process.argv);
}

module.exports.main = main;
