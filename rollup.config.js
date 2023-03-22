// ./`rollup.config.js`

import typescript from 'rollup-plugin-typescript';
import sourceMaps from 'rollup-plugin-sourcemaps';

export default {
  input: './src/main.ts',
  plugins: [
    typescript({
      exclude: 'node_modules/**',
      typescript: require('typescript'),
    }),
    sourceMaps(),
  ],
  output: [
    {
      format: 'es',
      file: 'dist/index.js',
      sourcemap: true,
    },
  ],
};
