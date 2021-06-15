import { randomizeOrder } from '__tests__/testUtils';

function expectRearranged(inputArray: unknown[], outputArray: unknown[]) {
  expect(inputArray.length).toBe(outputArray.length);
  if (inputArray.length === outputArray.length) {
    for (let i = 0; i < outputArray.length; i += 1) {
      expect(outputArray.includes(inputArray[i])).toBe(true);
      expect(inputArray.includes(outputArray[i])).toBe(true);
    }
  }
}

// test randomization of array order
describe(`should take an array and rearrange the elements randomly`, () => {
  const inputArray: number[] = [];
  for (let arraylen = 0; arraylen < 10; arraylen += 1) {
    inputArray.push(arraylen);
    test(`check random values`, () => {
      const outputArray = randomizeOrder(inputArray);
      expectRearranged(inputArray, outputArray);
    });
  }

  test(`edge case - empty array`, () => {
    const input: number[] = [];
    const output: number[] = [];
    expect(randomizeOrder(input)).toStrictEqual(output);
  });

  test(`edge case - duplicates`, () => {
    const input = [1, 1, 2];
    const possibleOutputs = [
      [1, 1, 2],
      [1, 2, 1],
      [2, 1, 1],
    ];
    const output = randomizeOrder(input);
    expectRearranged(input, output);
    const numberOfMatchingPossibleOutputs = possibleOutputs
      .map((possibleOutput) => {
        return JSON.stringify(output) === JSON.stringify(possibleOutput);
      })
      .filter((truthy) => {
        return truthy;
      }).length;
    expect(numberOfMatchingPossibleOutputs).toBe(1);
  });
});
