'use strict';

const fs = require('fs');
const fetch = require('isomorphic-fetch');
const hopsConfig = require('hops-config');

const fragmentsFile = require('./util').getFragmentsFile();

module.exports = function fetchFragments() {
  return fetch(hopsConfig.graphqlUri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: [
        /* eslint-disable indent */
        '       {',
        '         __schema {',
        '           types {',
        '             kind',
        '             name',
        '             possibleTypes {',
        '               name',
        '             }',
        '           }',
        '         }',
        '       }',
        /* eslint-enable indent */
      ].join('\n'),
    }),
  })
    .then(result => result.json())
    .then(result => {
      const filteredData = result.data.__schema.types.filter(type => {
        return type.possibleTypes !== null;
      });
      result.data.__schema.types = filteredData;
      return new Promise((resolve, reject) => {
        fs.writeFile(fragmentsFile, JSON.stringify(result.data), err => {
          if (err) {
            reject(err);
          } else {
            resolve(fragmentsFile);
          }
        });
      });
    });
};
