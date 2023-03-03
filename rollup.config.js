import { nodeResolve } from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import commonjs from '@rollup/plugin-commonjs'
import terser from '@rollup/plugin-terser'
import serve from 'rollup-plugin-serve'
import livereload from 'rollup-plugin-livereload'
import copy from 'rollup-plugin-copy'
import json from '@rollup/plugin-json'

// solution to failure of rollup watch: https://github.com/rollup/rollup/issues/1828#issuecomment-675629244
export default [
  {
    input: [
      // 'src/xdsh.ts',
      'src/demo.ts'
    ],
    output: [
      {
        dir: 'dist',
        formate: 'cjs',
        entryFileNames: '[name].cjs.js',
      },
      {
        dir: 'dist',
        formate: 'umd',
        entryFileNames: '[name].umd.js',
      },
      {
        dir: 'dist',
        format: 'esm',
        entryFileNames: '[name].esm.js',
      },
    ],
    plugins: [
      nodeResolve(),
      typescript(),
      commonjs(),
      terser(),
      serve({
        open: true,
        port: 8020,
        openPage: "/public/index.html",
      }),
      livereload('dist'),
      copy({
        targets: [
          { src: 'src/xdsh.css', dest: 'dist' }
        ]
      }),
      // https://github.com/microsoft/TypeScript/issues/25400#issuecomment-580720429
      json()
    ],
  }
]