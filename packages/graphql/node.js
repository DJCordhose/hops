'use strict';

const ReactApollo = require('react-apollo');

const hopsReact = require('hops-react');

const Common = require('./lib/common');
const constants = require('./lib/constants');
const introspectionResult = require('./lib/util').getIntrospectionResult();

class GraphQLContext extends Common {
  enhanceClientOptions(options) {
    return {
      ...super.enhanceClientOptions(options),
      ssrMode: true,
    };
  }

  getIntrospectionResult() {
    return introspectionResult;
  }

  getTemplateData(templateData, rootElement) {
    return ReactApollo.getDataFromTree(rootElement).then(() => {
      return {
        ...templateData,
        globals: [
          ...(templateData.globals || []),
          {
            name: constants.APOLLO_IQRD,
            value: this.getIntrospectionResult(),
          },
          {
            name: constants.APOLLO_STATE,
            value: this.client.cache.extract(),
          },
        ],
      };
    });
  }
}
exports.GraphQLContext = GraphQLContext;
exports.contextDefinition = GraphQLContext;

exports.createContext = hopsReact.combineContexts(
  hopsReact.ReactContext,
  GraphQLContext
);
