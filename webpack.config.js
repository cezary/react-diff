module.exports = {
  entry: './index.js',
  output: {
    filename: './dist/react-diff.js',
    sourceMapFilename: './dist/react-diff.map',
    library: 'Diff',
    libraryTarget: 'umd'
  },
  externals: {
    'react': 'React',
    'react/addons': 'React'
  },
  module: {
    loaders: [
      {test: /\.js$/, loader: 'jsx-loader'}
    ]
  }
};
