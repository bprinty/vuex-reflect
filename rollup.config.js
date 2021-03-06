import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import babel from 'rollup-plugin-babel'
import json from 'rollup-plugin-json';
import { terser } from "rollup-plugin-terser";

export default [
  {
    input: 'src/index.js',
    output: [
      {
        file: 'dist/index.cjs.js',
        format: 'cjs',
        name: 'vuex-reflect',
      },
      {
        file: 'dist/index.esm.js',
        format: 'esm',
        name: 'vuex-reflect',
      },
      {
        file: 'dist/index.min.js',
        format: 'cjs',
        name: 'vuex-reflect',
        plugins: [terser()],
      },
    ],
    plugins: [
      json(),
      resolve(),
      commonjs({
        include: 'node_modules/**',
      }),
      babel({
        exclude: 'node_modules/**',
      }),
    ],
  },
]
