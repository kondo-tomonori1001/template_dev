const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry:{
    'main': `./src/common/scripts/main/index.js`,
  },
  output:{
    path:path.join(__dirname,'dist'),
    filename:"common/scripts/[name].js"
  },
  module: {
    rules: [
      // ==== babel ====
      {
        test:/\.js$/,
        use:[
          {
            loader:"babel-loader",
            options: {
              presets: [
                "@babel/preset-env",
              ]
            }
          }
        ]
      },
    ]
  },
  target: ["web", "es5"],
  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery'
    }),
  ]
}