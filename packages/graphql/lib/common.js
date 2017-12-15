'use strict';
require('isomorphic-fetch');

const React = require('react');
const ReactApollo = require('react-apollo');

const ApolloClient = require('apollo-client').default;
const ApolloCache = require('apollo-cache-inmemory');
const ApolloLink = require('apollo-link-http');

const hopsConfig = require('hops-config');

module.exports = class Common {
  constructor(options = { graphql: {} }) {
    this.client = this.createClient(options.graphql);
  }

  createClient(options) {
    return new ApolloClient(this.enhanceClientOptions(options));
  }

  enhanceClientOptions(options) {
    return {
      ...options,
      link: options.link || this.createLink(),
      cache: options.cache || this.createCache(),
    };
  }

  createLink() {
    return new ApolloLink.HttpLink({
      uri: hopsConfig.graphqlUri,
    });
  }

  createCache() {
    return new ApolloCache.InMemoryCache({
      fragmentMatcher: this.createFragmentMatcher(),
    });
  }

  createFragmentMatcher() {
    const result = this.getIntrospectionResult();
    if (result) {
      return new ApolloCache.IntrospectionFragmentMatcher({
        introspectionQueryResultData: this.getIntrospectionResult(),
      });
    } else {
      return new ApolloCache.HeuristicFragmentMatcher();
    }
  }

  enhanceElement(reactElement) {
    return React.createElement(
      ReactApollo.ApolloProvider,
      {
        client: this.client,
      },
      reactElement
    );
  }
};
