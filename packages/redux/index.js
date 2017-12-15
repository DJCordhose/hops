'use strict';

const React = require('react');
const Redux = require('redux');
const ReactRedux = require('react-redux');
const ReduxThunkMiddleware = require('redux-thunk').default;

const hopsReact = require('hops-react');

const REDUX_STATE = 'REDUX_STATE';

class ReduxContext {
  constructor(options = {}) {
    this.reducers = {};
    this.middlewares = options.middlewares || [ReduxThunkMiddleware];
    if (!Array.isArray(this.middlewares)) {
      throw new Error('middlewares needs to be an array');
    }
    Object.keys(options.reducers || {}).forEach(key => {
      this.registerReducer(key, options.reducers[key]);
    });
  }

  registerReducer(namespace, reducer) {
    this.reducers[namespace] = reducer;
    if (this.store) {
      this.store.replaceReducer(Redux.combineReducers(this.reducers));
    }
  }

  getStore() {
    if (module.hot) {
      this.store = global.store || (global.store = this.createStore());
    }
    return this.store || (this.store = this.createStore());
  }

  createStore() {
    return Redux.createStore(
      Redux.combineReducers(this.reducers),
      global[REDUX_STATE],
      this.createEnhancer()
    );
  }

  createEnhancer() {
    return this.composeMiddlewares();
  }

  composeEnhancers(...args) {
    return (global.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || Redux.compose)(
      ...args
    );
  }

  composeMiddlewares() {
    return this.composeEnhancers(...this.applyMiddlewares());
  }

  applyMiddlewares() {
    return this.getMiddlewares().map(middleware =>
      Redux.applyMiddleware(middleware)
    );
  }

  getMiddlewares() {
    return this.middlewares;
  }

  enhanceElement(reactElement) {
    return React.createElement(
      ReactRedux.Provider,
      {
        store: this.getStore(),
      },
      reactElement
    );
  }

  getTemplateData(templateData) {
    return Object.assign({}, templateData, {
      globals: (templateData.globals || []).concat([
        {
          name: REDUX_STATE,
          value: this.getStore().getState(),
        },
      ]),
    });
  }
}

exports.ReduxContext = ReduxContext;
exports.contextDefinition = ReduxContext;

exports.createContext = hopsReact.combineContexts(
  hopsReact.ReactContext,
  ReduxContext
);
