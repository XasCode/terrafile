import { spy } from '__tests__/testUtils';

// spyOn console, stdout, stderr, process.exit, etc...
spy.setup();

// allow time for cleanup routines (like rimraf) to finish
jest.setTimeout(60000);
