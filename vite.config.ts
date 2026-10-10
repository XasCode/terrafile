/// <reference types="vitest" />

import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { builtinModules } from 'node:module';
import { defineConfig } from 'vitest/config';
import escapeRegExp from 'lodash/escapeRegExp';
import dts from 'unplugin-dts/vite';
import pkg from './package.json' with { type: 'json' };

const externals = [
  ...builtinModules,
  ...builtinModules.map((module) => `node:${module}`),
  ...Object.keys(pkg.dependencies).map(
    (name) => {
      return new RegExp(`^${escapeRegExp(name)}(/.+)?$`);
    },
  ),
];

export default defineConfig({
  define: {
    configversion: JSON.stringify(pkg.version),
  },
  build: {
    lib: {
      entry: resolve(fileURLToPath(new URL('.', import.meta.url)), `src/cli/terrafile.ts`),
      name: `terrafile`,
      fileName: `terrafile`,
      formats: [`es`],
    },
    rolldownOptions: {
      external: externals,
    },
  },
  optimizeDeps: {
    exclude: externals as string[],
  },
  plugins: [
    dts(),
  ],
  test: {
    setupFiles: `./__tests__/testSetupFile.ts`,
    onConsoleLog(log, type) {
      const directoryErrorPrefix = `Error deleting dir: `;
      if (
        type === `stderr` &&
        log.startsWith(directoryErrorPrefix) &&
        !existsSync(log.slice(directoryErrorPrefix.length))
      ) {
        return false;
      }
    },
    coverage: {
      provider: `istanbul`,
      reporter: [`text`, `json`, `html`, `lcov`],
      include: ['src'],
      exclude: ['src/**/*.d.ts', 'src/**/__tests__/**'],
    },
    environment: `node`,
    testTimeout: 20000,
    include: [`**/*.spec.ts`],
  },
});
