#!/usr/bin/env node
'use strict';

const yargs = require('yargs');

const findCommands = require('./lib/commands');
const packageManifest = require('./package.json');

module.exports = function run(defineCommand, command) {
  const args = yargs
    .version(packageManifest.version)
    .usage('Usage: $0 <command> [options]')
    .help('help')
    .alias('h', 'help')
    .demandCommand();
  const argv = process.argv.slice(2);

  if (defineCommand && command) {
    defineCommand(args);
    argv.unshift(command);
  } else {
    findCommands().forEach(commandPath => {
      require(commandPath)(args);
    });
  }

  args.parse(argv);
};

if (require.main === module) {
  module.exports();
}
