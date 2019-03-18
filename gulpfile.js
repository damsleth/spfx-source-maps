'use strict';

const gulp  = require('gulp');
const build = require('@microsoft/sp-build-web');

const webpack              = require('webpack');
const gulpSequence         = require('gulp-sequence');
const insertSourceMapsTaks = require('./insertSourceMapsTasks');

build.addSuppression(`Warning - [sass] The local CSS class 'ms-Grid' is not camelCase and will not be type-safe.`);

/**
 * Force the creation of source map files even for production
 * @see https://blog.mastykarz.nl/debug-production-version-sharepoint-framework-solution/#generatesourcemapforreleasebuild ~
 */
build.configureWebpack.mergeConfig({
    additionalConfiguration: (generatedConfiguration) => {
        generatedConfiguration.devtool = 'source-map';
        // force
        for (var i = 0; i < generatedConfiguration.plugins.length; i++) {
            const plugin = generatedConfiguration.plugins[i];
            if (plugin instanceof webpack.optimize.UglifyJsPlugin) {
                plugin.options.sourceMap = true;
                break;
            }
        }

        return generatedConfiguration;
    }
});

build.initialize(gulp);

// Creates a gulp task to insert source maps into the final sppkg
gulp.task('insertSourceMaps', insertSourceMapsTaks);

// Combines all tasks into a single command
gulp.task('dist', gulpSequence('clean', 'bundle', 'package-solution', 'insertSourceMaps'));
