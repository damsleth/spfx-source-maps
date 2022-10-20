'use strict'

const build = require('@microsoft/sp-build-web')
const gulp = require('gulp')
const insertSourceMapsTasks = require('./insertSourceMapsTasks')
gulp.task('insertSourceMaps', insertSourceMapsTasks)
build.addSuppression(`Warning - [sass] The local CSS class 'ms-Grid' is not camelCase and will not be type-safe.`)

var getTasks = build.rig.getTasks
build.rig.getTasks = function () {
  var result = getTasks.call(build.rig)
  result.set('serve', result.get('serve-deprecated'))
  result.additionalConfiguration = (generatedConfiguration) => {
    generatedConfiguration.devtool = 'source-map'
    // force sourcemap = true
    for (var i = 0; i < generatedConfiguration.plugins.length; i++) {
      const plugin = generatedConfiguration.plugins[i]
      if (plugin instanceof webpack.optimize.UglifyJsPlugin) {
        plugin.options.sourceMap = true
        break
      }
    }
    return generatedConfiguration
  }
  return result
}
build.initialize(require('gulp'))
