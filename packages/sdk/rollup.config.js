import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import dts from 'rollup-plugin-dts';
import { createRequire } from 'module';

// Read version from package.json (need require for JSON)
const require = createRequire(import.meta.url);
const pkg = require('./package.json');

/**
 * Rollup configuration for AdEx Browser SDK
 *
 * Builds:
 * - UMD bundle for script tag usage (global: AdExSDK)
 * - ESM bundle for npm/module usage
 * - TypeScript declaration file
 */
export default [
  // Main bundles - UMD and ESM
  {
    input: 'src/index.ts',
    output: [
      {
        file: pkg.main,
        format: 'umd',
        name: 'AdExSDK',
        sourcemap: true,
        exports: 'named',
      },
      {
        file: pkg.module,
        format: 'esm',
        sourcemap: true,
      },
    ],
    plugins: [
      resolve({
        browser: true,
      }),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
      }),
      terser({
        compress: {
          drop_console: false,
          pure_funcs: [],
        },
        mangle: {
          reserved: ['AdExSDK', 'AdExClient'],
        },
      }),
    ],
  },

  // TypeScript declarations
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'es',
    },
    plugins: [dts()],
  },
];
