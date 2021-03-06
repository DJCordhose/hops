'use strict';

var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');

var hopsConfig = require('hops-config');

module.exports = function Plugin(regExp) {
  this.apply = function(compiler) {
    compiler.plugin('emit', function(compilation, callback) {
      var assetKeys = Object.keys(compilation.assets);
      Promise.all(
        assetKeys.reduce(function(result, assetKey) {
          if (regExp.test(assetKey)) {
            var fileName = path.resolve(hopsConfig.cacheDir, assetKey);
            var fileContent = compilation.assets[assetKey].source();
            delete compilation.assets[assetKey];
            result.push(
              new Promise(function(resolve, reject) {
                mkdirp.sync(hopsConfig.cacheDir);
                fs.writeFile(fileName, fileContent, function(err) {
                  err ? reject(err) : resolve();
                });
              })
            );
          }
          return result;
        }, [])
      )
        .then(function() {
          callback();
        })
        .catch(callback);
    });
  };
};
