import { expect, it, vi } from 'vitest';

vi.mock('../terrafile.js', () => ({
  main: vi.fn(),
}));

import { main } from '../terrafile.js';

it('passes process.argv to main', async () => {
  await import('../cli.js');

  expect(main).toHaveBeenCalledWith(process.argv);
});