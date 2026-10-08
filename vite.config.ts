/// <reference types="vitest" />

import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { builtinModules } from 'node:module';
import { defineConfig } from 'vite';
import escapeRegExp from 'lodash/escapeRegExp';
import dts from 'vite-plugin-dts';
import pkg from './package.json';
import commonjsExternals from 'vite-plugin-commonjs-externals';

const externals = [
  ...builtinModules,
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
      entry: resolve(__dirname, `src/cli/terrafile.ts`),
    },
    rollupOptions: {
      output: [
        {
          format: `umd`,
          name: `terrafile`,
          entryFileNames: (_chunk) => {
            return `[name].js`;
          },
        },
        {
          format: `es`,
        },
      ],
    },
  },
  optimizeDeps: {
    exclude: externals as string[],
  },
  plugins: [
    dts(),
    commonjsExternals({
      externals,
    }),
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
    },
    environment: `node`,
    testTimeout: 20000,
    include: [`**/*.spec.ts`],
  },
});
