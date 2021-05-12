import { resolve as _resolve } from 'path';
import { execFile } from 'child_process';
import { ExecResult, Path } from '../src/types';

function getRandomInt(max: number): number {
  return Math.floor(Math.random() * max);
}

function randomizeOrder(incoming: unknown[]): unknown[] {
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

async function cli(args: string[], cwd?: Path): Promise<ExecResult> {
  return new Promise((resolve) => {
    execFile(
      'node',
      [`${_resolve('./dist/terrafile')}`, ...args],
      {
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
function calcCartesian(...args: unknown[][]): unknown[][] {
  const r: unknown[][] = [],
    max = args.length - 1;
  function helper(arr: unknown[], i: number) {
    for (let j = 0, l = args[i].length; j < l; j++) {
      const a: unknown[] = [...arr, args[i][j]];
      if (i === max) r.push(a);
      else helper(a, i + 1);
    }
  }
  helper([], 0);
  return r;
}
function cartesian(...args: unknown[][]): unknown[][] {
  if (args.length === 0) return [];
  return calcCartesian(...args);
}

export { getRandomInt, randomizeOrder, cli, cartesian };
