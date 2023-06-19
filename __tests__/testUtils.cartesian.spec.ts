import { beforeAll, afterEach, beforeEach, describe, it, expect, vi } from 'vitest';
import { cartesian } from './testUtils';

describe(`should take arrays and generate combinations of the elements`, () => {
  it(`take and array of arrays and verify outout`, () => {
    const input = [
      [1, 2],
      [3, 4],
      [5, 6],
    ];
    const output = [
      [1, 3, 5],
      [1, 3, 6],
      [1, 4, 5],
      [1, 4, 6],
      [2, 3, 5],
      [2, 3, 6],
      [2, 4, 5],
      [2, 4, 6],
    ];
    expect(cartesian(...input)).toStrictEqual(output);
  });

  it(`edge case when called with no args`, () => {
    const input = [] as number[][];
    const output = [] as number[][];
    expect(cartesian(...input)).toStrictEqual(output);
  });

  it(`edge case when one of the lists is empty`, () => {
    const input = [[1, 2], [], [3, 4]];
    const output = [] as number[][];
    expect(cartesian(...input)).toStrictEqual(output);
  });

  it(`edge case when one list withone elment`, () => {
    const input = [[1]];
    expect(cartesian(...input)).toStrictEqual(input);
  });

  it(`when different size lists`, () => {
    const input = [
      [1, 2],
      [3, 4, 5],
    ];
    const output = [
      [1, 3],
      [1, 4],
      [1, 5],
      [2, 3],
      [2, 4],
      [2, 5],
    ];
    expect(cartesian(...input)).toStrictEqual(output);
  });
});
