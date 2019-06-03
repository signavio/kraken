const { BABEL_ENV, NODE_ENV } = process.env

module.exports = {
  presets: [
    [
      '@babel/env',
      {
        modules: BABEL_ENV === 'es6' ? false : 'commonjs',
        targets: {
          browsers: [
            'chrome >= 50',
            'firefox >= 52',
            'safari >= 10',
            'ie >= 11',
          ],
        },
      },
    ],
    '@babel/react',
  ],
  plugins: [
    '@babel/transform-runtime',
    '@babel/plugin-transform-flow-strip-types',
    '@babel/plugin-proposal-object-rest-spread',
    '@babel/plugin-proposal-export-namespace-from',
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-proposal-function-bind',

    'syntax-dynamic-import',
    'lodash',

    ...(NODE_ENV === 'test' ? ['dynamic-import-node'] : []),
  ],
}
