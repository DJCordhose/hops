import React from 'react';
import ReactDOM from 'react-dom/server';
import { StaticRouter } from 'react-router/es';
import Helmet from 'react-helmet';
import mixinable from 'mixinable';

import hopsConfig from 'hops-config';

import defaultTemplate from './lib/template';

export * from './lib/components';

export const combineContexts = mixinable({
  bootstrap: mixinable.async.parallel,
  enhanceElement: mixinable.async.compose,
  getTemplateData: mixinable.async.pipe,
  renderTemplate: mixinable.override,
});

export class ReactContext {
  constructor(options = {}) {
    this.routerOptions = Object.assign(
      {
        location: options.request && options.request.path,
        basename: hopsConfig.basePath,
        context: {},
      },
      options.router
    );
    this.template = options.template || defaultTemplate;
  }

  enhanceElement(reactElement) {
    return React.createElement(StaticRouter, this.routerOptions, reactElement);
  }

  getTemplateData(templateData, rootElement) {
    return Object.assign({}, templateData, {
      routerContext: this.routerOptions.context,
      assets: hopsConfig.assets,
      manifest: hopsConfig.manifest,
      globals: templateData.globals || [],
    });
  }

  renderTemplate(templateData) {
    return this.template(
      Object.assign({ helmet: Helmet.renderStatic() }, templateData)
    );
  }
}

export const contextDefinition = ReactContext;

export const createContext = combineContexts(ReactContext);

const cloneContext = mixinable.replicate(([initialArgs], [newArgs]) => [
  Object.assign({}, initialArgs, newArgs),
]);

export const render = (reactElement, _context) => {
  return (req, res, next) => {
    const renderContext = cloneContext(_context, { request: req });
    renderContext
      .bootstrap()
      .then(() => renderContext.enhanceElement(reactElement))
      .then(rootElement => {
        return renderContext
          .getTemplateData({}, rootElement)
          .then(templateData => {
            return { templateData: templateData, rootElement: rootElement };
          });
      })
      .then(result => {
        const templateData = result.templateData;
        const rootElement = result.rootElement;
        const markup = renderContext.renderTemplate(
          Object.assign(
            {
              markup: ReactDOM.renderToString(rootElement),
            },
            templateData
          )
        );
        const routerContext = templateData.routerContext;

        if (routerContext.miss) {
          next();
        } else if (routerContext.url) {
          res.status(routerContext.status || 301);
          res.set('Location', routerContext.url);
          res.end();
        } else {
          res.status(routerContext.status || 200);
          res.type('html');
          res.send(markup);
        }
      })
      .catch(next);
  };
};
