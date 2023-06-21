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
    setupFiles: `./__tests__/testUtils/testSetupFile.ts`,
    coverage: {
      provider: `istanbul`,
      reporter: [`text`, `json`, `html`, `lcov`],
      exclude: [
        'coverage/**',
        'dist/**',
        'packages/*/test?(s)/**',
        '**/*.d.ts',
        'cypress/**',
        'test?(s)/**',
        'test?(-*).?(c|m)[jt]s?(x)',
        '**/*{.,-}{test,spec}.?(c|m)[jt]s?(x)',
        '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
        '**/.{eslint,mocha,prettier}rc.{?(c|m)js,yml}',
      ],
      all: true,
    },
    environment: `node`,
    testTimeout: 20000,
    include: [`**/*.spec.ts`, `**/*.*.spec.ts`],
  },
});
