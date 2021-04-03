const path = require("path");
const exec = require("child_process").exec;

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function randomizeOrder(incoming) {
  let workingCopy = [...incoming];
  const outgoing = [];
  for (let i = incoming.length; i > 0; i--) {
    const selected = getRandomInt(i);
    outgoing.push(workingCopy[selected]);
    workingCopy = [
      ...workingCopy.slice(0, selected),
      ...workingCopy.slice(selected + 1),
    ];
  }
  return outgoing;
}

async function cli(args, cwd) {
  return new Promise((resolve) => {
    exec(
      `node ${path.resolve("./src/terrafile")} ${args.join(" ")}`,
      {
        env: process.env,
        cwd,
      },
      (error, stdout, stderr) => {
        resolve({
          code: error && error.code ? error.code : 0,
          error,
          stdout,
          stderr,
        });
      }
    );
  });
}

exports.getRandomInt = getRandomInt;
exports.randomizeOrder = randomizeOrder;
exports.cli = cli;
