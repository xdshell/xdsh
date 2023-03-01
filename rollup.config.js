import { nodeResolve } from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import commonjs from '@rollup/plugin-commonjs'
import terser from '@rollup/plugin-terser'
import serve from 'rollup-plugin-serve'
import livereload from 'rollup-plugin-livereload'
import copy from 'rollup-plugin-copy'

export default {
  // solution to failure of rollup watch: https://github.com/rollup/rollup/issues/1828#issuecomment-675629244
  input: 'src/xdsh.ts',
  external: ['./xdsh.css'],
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
    })
  ],
}