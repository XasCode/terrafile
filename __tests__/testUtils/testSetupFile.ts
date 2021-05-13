import { spy } from '.';

// spyOn console, stdout, stderr, process.exit, etc...
spy.setup();

// allow time for cleanup routines (like rimraf) to finish
jest.setTimeout(30000);
