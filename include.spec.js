const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

describe("Unit tests for include", () => {
  beforeEach(() => {
    consoleSpy.mockClear()
  });
  test('included output should be ...', async () => {
    const { printMsg } = require('./include');
    printMsg();
    expect(console.log).toBeCalledTimes(1)
    expect(console.log).toHaveBeenLastCalledWith(`This is a test of requiring another file.`)
  });  
});
