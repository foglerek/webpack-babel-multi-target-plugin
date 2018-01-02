const path = require('path');

const babelHelpers = require('../../src/babel.helpers');

/** {webpack.Configuration} **/
module.exports = {

    entry: {
        'main': './src/entry.ts',
    },

    module: {
        rules: [
            {
                test: /\.ts$/,
                use: [
                    babelHelpers.configureBabelLoader(babelHelpers.browserProfiles.modern, ['lodash']),
                    {
                        loader: 'awesome-typescript-loader',
                        options: {
                            // required for instances when the build is run from a different working directory
                            configFileName: path.resolve(__dirname, 'tsconfig.json'),
                            useCache: true,
                            sourceMaps: true,
                            cacheDirectory: 'node_modules/.cache/awesome-typescript-loader',
                        },
                    }
                ],
            },
            {
                test: /\.js$/,
                exclude: babelHelpers.excludedPackages,
                use: [
                    babelHelpers.configureBabelLoader(babelHelpers.browserProfiles.modern, ['lodash']),
                ],
            }
        ],
    },
};