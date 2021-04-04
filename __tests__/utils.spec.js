const { randomizeOrder } = require("../src/utils");

// test randomization of array order
describe("should take an array and rearrange the elements randomly", () => {
  const inputArray = [];
  for (let arraylen = 0; arraylen < 10; arraylen++) {
    inputArray.push(arraylen);
    test(`check random values`, () => {
      const outputArray = randomizeOrder(inputArray);
      for (let i = 0; i < outputArray.length; i++) {
        expect(inputArray.length).toBe(outputArray.length);
        expect(outputArray.includes(inputArray[i])).toBe(true);
        expect(inputArray.includes(outputArray[i])).toBe(true);
      }
    });
  }
});
