import { nodeResolve } from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import commonjs from '@rollup/plugin-commonjs'
import terser from '@rollup/plugin-terser'
import copy from 'rollup-plugin-copy'
import json from '@rollup/plugin-json'

export default [
  {
    input: 'src/demo.ts',
    output: [
      {
        dir: 'demo/assets',
        format: 'umd',
        entryFileNames: '[name].umd.js',
      }
    ],
    plugins: [
      nodeResolve(),
      typescript(),
      commonjs(),
      terser(),
      copy({
        targets: [
          { src: 'src/xdsh.css', dest: 'dist' },
          { src: 'src/xdsh.css', dest: 'demo/assets' },
          { src: 'public/index.html', dest: 'demo' }
        ]
      }),
      json()
    ],
  }
]