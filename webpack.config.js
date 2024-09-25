// webpack.config.js

const webpack = require('webpack');
const dotenv = require('dotenv');

dotenv.config();

module.exports = {
    module: {
      rules: [
        {
          test: /\.css$/,
          use: [
            'style-loader',
            'css-loader',
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  plugins: ['tailwindcss', 'autoprefixer'],
                },
              },
            },
          ],
        },
      ],
      plugins: [
        new webpack.DefinePlugin({
          'process.env': JSON.stringify(process.env),
        }),
      ],
    },
  };
  