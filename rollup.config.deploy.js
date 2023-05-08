import { nodeResolve } from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import commonjs from '@rollup/plugin-commonjs'
import terser from '@rollup/plugin-terser'
import copy from 'rollup-plugin-copy'
import json from '@rollup/plugin-json'
import htmlTemplate from 'rollup-plugin-generate-html-template'

export default [
  {
    input: 'demo.ts',
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
          { src: 'src/style/xdsh.css', dest: 'demo/assets' },
          { src: 'public/favicon.ico', dest: 'demo/assets' },
        ]
      }),
      json(),
      htmlTemplate({
        template: 'public/demo.html',
        target: 'demo/index.html',
        replaceVars: {
          'icon_url': 'assets/favicon.ico',
          'css_url': 'assets/xdsh.css',
        }
      }),
    ],
  }
]