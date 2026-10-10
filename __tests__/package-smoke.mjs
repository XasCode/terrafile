import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import process from 'node:process';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const require = createRequire(import.meta.url);
const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
const cliPath = fileURLToPath(new URL('../dist/cli.js', import.meta.url));

test('built CLI reports the package version', () => {
  const result = spawnSync(process.execPath, [cliPath, '--version'], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout.trim(), packageJson.version);
});

test('package entry exposes the ESM CLI API', async () => {
  const warnings = [];
  const originalEmitWarning = process.emitWarning;
  process.emitWarning = (...args) => warnings.push(args);

  try {
    const terrafile = await import('terrafile');
    assert.equal(typeof terrafile.main, 'function');
    assert.equal(typeof terrafile.runIfMain, 'function');
    assert.equal(warnings.some(([, options]) => [
      'DEP_FS_HELPERS_CJS',
      'DEP_CLONER_GIT_CJS',
      'DEP_FETCHER_AXIOS_CJS',
    ].includes(options?.code)), false);
  } finally {
    process.emitWarning = originalEmitWarning;
  }
});

test('package entry does not expose a CommonJS API', () => {
  assert.throws(() => require('terrafile'), { code: 'ERR_PACKAGE_PATH_NOT_EXPORTED' });
});
