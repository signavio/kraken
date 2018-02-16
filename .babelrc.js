const { BABEL_ENV } = process.env

module.exports = {
  presets: {
    presets: [
      [
        'env',
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
      'stage-0',
      'react',
    ],
  },
  plugins: ['transform-runtime', 'lodash'],
}
