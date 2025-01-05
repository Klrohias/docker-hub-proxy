import * as esbuild from 'esbuild'

await esbuild.build({
  entryPoints: ['./src'],
  bundle: true,
  outfile: 'dist/bundle.js',
  platform: 'node',
  target: 'node18',
  treeShaking: true,
  minify: true
})
