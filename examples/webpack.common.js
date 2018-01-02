const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');

const BabelMultiTargetPlugin =  require('../src/babel.multi.target.plugin');
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
const HtmlWebpackPlugin =       require('html-webpack-plugin');

const babelHelpers = require('../src/babel.helpers');

const commonConfig = (workingDir, pluginsConfig = null) => merge({

    output: {
        path: path.resolve(workingDir, '../../out/examples', path.basename(workingDir)),
        sourceMapFilename: '[file].map',
    },

    devtool: '#source-map',

    context: workingDir,

    resolve: {
        extensions: ['.ts', '.js', '.css', '.html'],

        // note that es2015 comes first, which allows using esm2015 outputs from Angular Package Format 5 packages
        mainFields: [
            'es2015',
            'module',
            'main'
        ],
    },

    module: {
        rules: [
            {
                test: /\.html$/,
                loader: 'html-loader',
            },
        ],
    },

    plugins: [
        new webpack.optimize.CommonsChunkPlugin({
            name: 'runtime'
        }),
        new HardSourceWebpackPlugin(),
        new HtmlWebpackPlugin({
            cache: false,
            inject: 'body',
            title: `Babel Multi Target Plugin Example: ${path.basename(workingDir)}`,
            template: '../index.html',
        }),
        new BabelMultiTargetPlugin({
            key: 'es5',
            options: babelHelpers.configureBabelTransformOptions(babelHelpers.browserProfiles.legacy),
            plugins: () => commonConfig(workingDir, pluginsConfig).plugins,
        }),
    ],
}, pluginsConfig ? pluginsConfig() : {});
module.exports = commonConfig;