import { randomizeOrder } from './utils';

// test randomization of array order
describe('should take an array and rearrange the elements randomly', () => {
  const inputArray: number[] = [];
  for (let arraylen = 0; arraylen < 10; arraylen++) {
    inputArray.push(arraylen);
    test('check random values', () => {
      const outputArray = randomizeOrder(inputArray);
      expectRearranged(inputArray, outputArray);
    });
  }

  test('edge case - empty array', () => {
    const input: number[] = [];
    const output: number[] = [];
    expect(randomizeOrder(input)).toStrictEqual(output);
  });

  test('edge case - duplicates', () => {
    const input = [1, 1, 2];
    const possibleOutputs = [
      [1, 1, 2],
      [1, 2, 1],
      [2, 1, 1],
    ];
    const output = randomizeOrder(input);
    expectRearranged(input, output);
    const numberOfMatchingPossibleOutputs = possibleOutputs
      .map(
        (possibleOutput) =>
          JSON.stringify(output) === JSON.stringify(possibleOutput)
      )
      .filter((truthy) => truthy).length;
    expect(numberOfMatchingPossibleOutputs).toBe(1);
  });
});

/////////// helpers //////////

function expectRearranged(inputArray: unknown[], outputArray: unknown[]) {
  outputArray.map((_, i, outArr) => {
    expect(inputArray.length).toBe(outArr.length);
    expect(outArr.includes(inputArray[i])).toBe(true);
    expect(inputArray.includes(outArr[i])).toBe(true);
  });
}
