// eslint-disable-next-line max-len
// from: https://stackoverflow.com/questions/15298912/javascript-generating-combinations-from-n-arrays-with-m-elements
function calcCartesian(...args: unknown[][]): unknown[][] {
  const r: unknown[][] = [];
  const max = args.length - 1;
  function helper(arr: unknown[], i: number) {
    for (let j = 0, l = args[i].length; j < l; j += 1) {
      const a: unknown[] = [...arr, args[i][j]];
      if (i === max) r.push(a);
      else helper(a, i + 1);
    }
  }
  helper([], 0);
  return r;
}

// cartesian() takes an array of arrays and otuputs a list of all combinations
// made up of one element from each of the arrays.
function cartesian(...args: unknown[][]): unknown[][] {
  if (args.length === 0) return [];
  return calcCartesian(...args);
}

export { cartesian };
