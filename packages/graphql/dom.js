import { combineContexts, ReactContext } from 'hops-react';

import Common from './lib/common';
import constants from './lib/constants';

export class GraphQLContext extends Common {
  createCache() {
    return super.createCache().restore(global[constants.APOLLO_STATE]);
  }

  getIntrospectionResult() {
    return global[constants.APOLLO_IQRD];
  }
}

export const contextDefinition = GraphQLContext;

export const createContext = combineContexts(ReactContext, GraphQLContext);
