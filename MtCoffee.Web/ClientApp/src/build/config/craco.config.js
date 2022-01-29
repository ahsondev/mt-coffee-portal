// https://github.com/gsoft-inc/craco/blob/master/packages/craco/README.md#installation
const fs = require('fs');
const path = require('path');
const getPath = relativePath => path.resolve(fs.realpathSync(process.cwd()), relativePath);

// import conf from 'dotenv';
// const confOutput = conf.config();
// // const confOutput = require('dotenv').config();
// Object.keys(confOutput.parsed || {}).forEach(k => {
//   process.env[k] = (confOutput.parsed || {})[k];
// });
module.exports = {
    reactScriptsVersion: "react-scripts" /* (default value) */,
    webpack: {
        alias: {
            '@root': getPath('src/'),
            '@components': getPath('src/components'),
            '@utils': getPath('src/utils'),
            '@pages': getPath('src/components/pages')
        }
    },
    jest: {
      configure: {
        moduleNameMapper: {
          '^@(.*)$': '<rootDir>/src$1'
        }
      }
    },
    style: {
        sass: {
            loaderOptions: { /* Any sass-loader configuration options: https://github.com/webpack-contrib/sass-loader. */
                // Prefer 'sass' (dart-sass) over 'node-sass' if both packages are installed.
                implementation: require('node-sass'),
                sourceMap: true,
                // Workaround for this bug: https://github.com/webpack-contrib/sass-loader/issues/804
                webpackImporter: false,
                additionalData: `@use 'sass:math';
                @import 'shared';`,
                sassOptions: {
                    indentWidth: 4,
                    includePaths: [
                        getPath("src/style")
                    ],
                    outputStyle: 'compressed'
                }
            },
        }
    }
};