import { nodeResolve } from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import commonjs from '@rollup/plugin-commonjs'
import terser from '@rollup/plugin-terser'
import serve from 'rollup-plugin-serve'
import livereload from 'rollup-plugin-livereload'
import copy from 'rollup-plugin-copy'
import json from '@rollup/plugin-json'
import htmlTemplate from 'rollup-plugin-generate-html-template'

// solution to failure of rollup watch: https://github.com/rollup/rollup/issues/1828#issuecomment-675629244
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
      serve({
        open: true,
        port: 8020,
        openPage: "/demo/index.html",
        contentBase: 'demo',
      }),
      livereload('demo'),
      copy({
        targets: [
          // { src: 'src/xdsh.css', dest: 'dist' },
          { src: 'src/xdsh.css', dest: 'demo/assets' },
          { src: 'src/favicon.ico', dest: 'demo/assets' },
          { src: 'public/index.html', dest: 'demo' }
        ]
      }),
      // https://github.com/microsoft/TypeScript/issues/25400#issuecomment-580720429
      json(),
      htmlTemplate({
        template: 'public/template.html',
        target: 'demo/index.html',
        replaceVars: {
          'icon_url': 'assets/favicon.ico',
          'css_url': 'assets/xdsh.css',
        }
      }),
    ],
  }
]