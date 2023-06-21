/// <reference types="vitest" />

import { resolve } from 'path';
import { defineConfig } from 'vite';
import lodash from 'lodash';
import dts from 'vite-plugin-dts';
import builtinModules from 'builtin-modules';
import pkg from './package.json';
import commonjsExternals from 'vite-plugin-commonjs-externals';

const { escapeRegExp } = lodash;

const externals = [
  ...builtinModules,
  ...Object.keys(pkg.dependencies).map(
    (name) => {
      return new RegExp(`^` + escapeRegExp(name) + `(\\/.+)?$`);
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
    coverage: {
      provider: `istanbul`,
      reporter: [`text`, `json`, `html`, `lcov`],
    },
    environment: `node`,
    testTimeout: 20000,
  },
});
