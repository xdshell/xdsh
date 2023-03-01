import { nodeResolve } from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import commonjs from '@rollup/plugin-commonjs'
import terser from '@rollup/plugin-terser'
import serve from 'rollup-plugin-serve'
import livereload from 'rollup-plugin-livereload'

export default {
  // solution to failure of rollup watch: https://github.com/rollup/rollup/issues/1666#issuecomment-536227450
  watch: {
    // include: 'src/**/*'
    chokidar: {
      // paths: 'src/**',
      usePolling: true
    }
  },
  input: 'src/xdsh.ts',
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
    livereload('dist')
  ],
}