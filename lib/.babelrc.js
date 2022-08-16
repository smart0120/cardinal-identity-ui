module.exports = {
  presets: [
    '@emotion/babel-preset-css-prop',
    [
      'next/babel',
      {
        'preset-react': {
          runtime: 'automatic',
          importSource: '@emotion/react',
        },
      },
    ],
  ],
  plugins: ['babel-plugin-macros'],
}
