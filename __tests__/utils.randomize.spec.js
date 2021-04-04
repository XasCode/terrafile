const { randomizeOrder } = require("../src/utils");

// test randomization of array order
describe("should take an array and rearrange the elements randomly", () => {
  const inputArray = [];
  for (let arraylen = 0; arraylen < 10; arraylen++) {
    inputArray.push(arraylen);
    test("check random values", () => {
      const outputArray = randomizeOrder(inputArray);
      for (let i = 0; i < outputArray.length; i++) {
        expect(inputArray.length).toBe(outputArray.length);
        expect(outputArray.includes(inputArray[i])).toBe(true);
        expect(inputArray.includes(outputArray[i])).toBe(true);
      }
    });
  }

  test("edge case - empty array", () => {
    const input = [];
    const output = [];
    expect(randomizeOrder(input)).toStrictEqual(output);
  });

  test("edge case - duplicates", () => {
    const input = [1, 1, 2];
    const possibleOutputs = [
      [1, 1, 2],
      [1, 2, 1],
      [2, 1, 1],
    ];
    const output = randomizeOrder(input);
    for (let i = 0; i < output.length; i++) {
      expect(input.length).toBe(output.length);
      expect(output.includes(input[i])).toBe(true);
      expect(input.includes(output[i])).toBe(true);
    }
    const numberOfMatchingPossibleOutputs = possibleOutputs
      .map(
        (possibleOutput) =>
          JSON.stringify(output) === JSON.stringify(possibleOutput)
      )
      .filter((truthy) => truthy).length;
    expect(numberOfMatchingPossibleOutputs).toBe(1);
  });
});
