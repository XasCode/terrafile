import { vi } from 'vitest';

// setup(): spyOn/mock console messages, stderr, stdout, and process.exit
function setup(): void {
  vi.spyOn(console, `log`);
  vi.spyOn(console, `error`);
  vi.spyOn(process.stdout, `write`);
  vi.spyOn(process.stderr, `write`);
  vi.spyOn(process, `exit`).mockImplementation((): never => {
    throw new Error(`exit`);
  });
}

// clear(): clean up mocked spy functions
function clear(): void {
  vi.clearAllMocks();
}

export { setup, clear };
