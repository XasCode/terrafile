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

// eslint-disable-next-line max-len
// from: https://stackoverflow.com/questions/15298912/javascript-generating-combinations-from-n-arrays-with-m-elements
function calcCartesian(...args) {
  const r = [],
    max = args.length - 1;
  function helper(arr, i) {
    for (let j = 0, l = args[i].length; j < l; j++) {
      const a = [...arr, args[i][j]];
      if (i === max) r.push(a);
      else helper(a, i + 1);
    }
  }
  helper([], 0);
  return r;
}
function cartesian(...args) {
  if (args.length === 0) return [];
  return calcCartesian(...args);
}

exports.getRandomInt = getRandomInt;
exports.randomizeOrder = randomizeOrder;
exports.cli = cli;
exports.cartesian = cartesian;
