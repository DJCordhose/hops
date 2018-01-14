'use strict';

const fs = require('fs');
const path = require('path');

const root = require('pkg-dir').sync();

const binDir = path.join(root, 'node_modules', '.bin');

module.exports = function findCommands() {
  if (fs.existsSync(binDir)) {
    return fs
      .readdirSync(binDir)
      .filter(command => command.indexOf('hops-') === 0)
      .map(command => path.join(binDir, command))
      .concat(path.join(__dirname, '..', 'commands', 'start.js'));
  } else {
    return [];
  }
};
