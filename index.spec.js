const path = require('path');
const exec = require('child_process').exec;

const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
const consoleSpyErr = jest.spyOn(console, "error").mockImplementation();
const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {});

const helpContent = `Usage: index [options] [command]

Manage vendored modules using a JSON file.

Options:
  -V, --version      Show version information for terrafile
  -h, --help         display help for command

Commands:
  install [options]  Installs the files in your terrafile.json
  help [command]     display help for command`;

const helpInstallContent = `Usage: index install [options]

Installs the files in your terrafile.json

Options:
  -d, --directory <string>  module directory (default: "vendor/modules")
  -f, --file <string>       config file (default: "terrafile.json")
  -h, --help                display help for command`;

const unknownCommand = `error: unknown command 'foo'. See 'index --help'.`;

const unknownOptionShort = `error: unknown option '-b'`;
const unknownOptionLong = `error: unknown option '--bar'`;

const default_opts = {"directory":"vendor/modules","file":"terrafile.json"};


const version = require('./package.json').version;

const testBackends = ["", "./include.js", "./include.mock.js"];
const helpCommands = ["", "help"];
const commands = ["", "install", "foo"];
const helps = ["", "-h", "--help"];
const versions = ["", "-V", "--version"];
//const directories = ["", "-d bar", "--directory bar"];
//const files = ["", "-f foobar", "--file foobar"];
//const badOptions = ["", "-b", "--bar"];

//const commands = [""];
//const helps = [""];
//const versions = [""];
const directories = [""];
const files = [""];
const badOptions = [""];



const variations = [];

for (helpCommand of helpCommands) {
  for (command of commands) {
    for (help of helps) {
      for (ver of versions) {
        for (directory of directories) {
          for (file of files) {
            for (badOption of badOptions) {
              // Specify the options that should be passed to the install command
              function getOptions() {
                return {
                  ...default_opts,
                  ...(directory !== "" ? {directory: directory.split(' ')[1]} : {}),  // -d/--directory override default directory
                  ...(file !== "" ? {file: file.split(' ')[1]} : {})                  // -f/--file override default config file
                };
              }
              // Specify the return code for the CLI
              function getCode() {
                if (ver !== "" ) return 0;                                // if -V/--version then will print version and return code = 0
                if (helpCommand !== "" && command == "install") return 0; // if help + valid command, i.e. "help install" return code = 0
                if (helpCommand !== "" && command == "") return 0;        // if help and no command, return code = 0
                if (helpCommand !== "") return 1;                         // if help and invalid command, i.e. "help foo" return code = 1
                if (help !== "") return 0;                                // "-h/--help" flag return code = 0
                if (helpCommand == "" && command !== "install") return 1; // if command not valid (i.e. not install) and no "help...", then return code = 1
                if (badOption !== "" && command == "install") return 1;   // if command is valid (i.e. install) and an invalid option flag specified return code = 1
                return 0;                                                 // anything else, 
              }
              // Determines if the install command will be run
              function getCommand() {
                return command == "install" && helpCommand == "" && ver == "" && help == "" && badOption == "" ? "install" : "";
              }
              // Assembles the various options into a command
              function getArgs()  {
                return `${helpCommand} ${command} ${help} ${ver} ${directory} ${file} ${badOption}`.split(' ').filter(cur=>(cur.length > 0)).join(' ') 
              }

              // Add each test case to variations list
              variations.push({
                backends: testBackends,                    // run tests across a list of api implementations / mocks
                args: getArgs(),                           // the test command
                command: getCommand(),                     // api command to run or ""
                options: {                                 // arguments to be passed to the api command
                  ...default_opts,
                  ...(directory !== "" ? {directory: directory.split(' ')[1]} : {}),
                  ...(file !== "" ? {file: file.split(' ')[1]} : {})
                },
                code: getCode(),                           // the expected cli return code
                stdOut: getArgs() == "" ? "" :             // the expected cli stdout output
                  ver !== "" ? version :                                                                 // -V/--version
                  command !== "install" && command !== "" && helpCommand !== "" ? "" :                   // help foo (error unknown command)
                  command !== "install" && command !== "" && help == "" ? "" :                           // foo (error unknown command)
                  command == "install" && helpCommand !== "" ? helpInstallContent :                      // help install (show command help)
                  command == "install" && help !== "" ? helpInstallContent :                             // install -h/--help (show command help)
                  getCommand() !== "install" && (helpCommand == "help" || help !== "") ? helpContent :   // install command not run and help/-h/--help (display help usage)
                  command == "install" && badOption !== "" ? "" :                                        // install -b/--bar (error unknown option)
                  getCommand() !== "install" && (help == "") ? "" :                                      // install command not run and not -h/--help (error no command)
                  getCommand() == "install" && helpCommand == "" && help == "" && badOption == "" ? JSON.stringify(getOptions()) : // output from running install!!!
                  "",                                                                                    // otherwise, no output to stdout
                stdErr: getArgs() == "" ? helpContent :    // the expected cli stderr output
                  ver !== "" ? "" :                                                                      // -V/--version (not error)
                  command !== "install" && command !== "" && helpCommand !== "" ? helpContent :          // help foo (error display usage)
                  command !== "install" && command !== "" && help == "" ? unknownCommand :               // foo (error unknown command)
                  command == "install" && helpCommand !== "" ? "" :                                      // help install (not error)
                  command == "install" && help !== "" ? "" :                                             // install -h/--help (not error)
                  getCommand() !== "install" && (helpCommand == "help" || help !== "") ? "" :            // install command not run and help/-h/--help (not error)
                  command == "install" && badOption !== "" ? badOption[1] == "-" ? unknownOptionLong : unknownOptionShort : //install -b/--bar (error unknown option)
                  getCommand() !== "install" && (help == "") ? helpContent :                             // install command not run and not -h/--help (error no command)
                  getCommand() == "install" && helpCommand == "" && help == "" && badOption == "" ? "" : // output from running install!!!
                  "",                                                                                    // otherwise, no output to stderr
              });
            }
          }
        }
      }
    }
  }
}

// For each test case, we test both the implementations / mocks (BE) only and the results of running via the CLI with each implementaiton / mock
describe.each(variations)(`Iterate through test variations.`, ({backends, args, command, options, code, stdOut, stdErr}) => {

  beforeEach(() => {
    consoleSpy.mockClear();
    consoleSpyErr.mockClear();
    mockExit.mockClear();
  });

  // test the implementations / mocks (BE)
  test.each(backends)(`Check BE output (BE="%s", args="${args}")`, async (backend) => {
    const { install } = require(backend.length > 0 ? backend : './include');
    switch(command) {
      case "install": {
        install(options);
        expect(console.log).toBeCalledTimes(1);
        expect(console.log).toHaveBeenLastCalledWith(stdOut);
        break;
      }
      default: {
        expect(console.log).toBeCalledTimes(0);
      }
    }
  });

  // test CLI w/ just the mock
  test.each(backends.slice(-1))(`Check CLI output (BE="%s", args="${args}")`, async (backend) => {
    const result = await cli(args.split(' '), '.', backend);
    expect(result.stdout).toBe(`${stdOut}${stdOut.length>0?'\n':''}`);
    expect(result.stderr).toBe(`${stdErr}${stdErr.length>0?'\n':''}`);
    expect(result.code).toBe(code);
  });

  /*
  test.each(backends.slice(-1))(`Check CLI as module (BE="%s", args="${args}")`, async (backend) => {
    const {main} = require('./index');
    const myargs = [process.argv[0], path.resolve('./index'), ...(args.length > 0 ? args.split(' ') : [])];
    //console.warn(JSON.stringify(myargs));
    const result = main(myargs, backend);
    //expect(result.stdout).toBe(`${stdOut}${stdOut.length>0?'\n':''}`);
    //expect(result.stderr).toBe(`${stdErr}${stdErr.length>0?'\n':''}`);
    //expect(result.code).toBe(code);
    expect(console.log).toHaveBeenLastCalledWith(`${stdOut}${stdOut.length>0?'\n':''}`);
    //expect(result.stderr).toBe(`${stdErr}${stdErr.length>0?'\n':''}`);
    //expect(result.code).toBe(code);
  });
  */
  
  function cli(args, cwd, api) {
    return new Promise(resolve => { 
      exec(
        `node ${path.resolve('./index')} ${args.join(' ')}`,
        {
          env: api.length > 0 ? { ...process.env, terrafile_be_api: api } : { ...process.env },
          cwd
        },
        (error, stdout, stderr) => {
          resolve({
            code: error && error.code ? error.code : 0,
            error,
            stdout,
            stderr
          });
        }
      );
    });
  }
});
