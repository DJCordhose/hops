'use strict';

const React = require('react');
const ReactDOM = require('react-dom/server');
const ReactRouter = require('react-router');
const Helmet = require('react-helmet').Helmet;
const mixinable = require('mixinable');

const hopsConfig = require('hops-config');

const defaultTemplate = require('./lib/template');

exports.combineContexts = mixinable({
  bootstrap: mixinable.async.parallel,
  enhanceElement: mixinable.async.compose,
  getTemplateData: mixinable.async.pipe,
  renderTemplate: mixinable.override,
});

class ReactContext {
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
    return React.createElement(
      ReactRouter.StaticRouter,
      this.routerOptions,
      reactElement
    );
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
exports.ReactContext = ReactContext;
exports.contextDefinition = ReactContext;

exports.createContext = exports.combineContexts(ReactContext);

const cloneContext = mixinable.replicate(([initialArgs], [newArgs]) => {
  return [Object.assign({}, initialArgs, newArgs)];
});

exports.render = function(reactElement, _context) {
  return function(req, res, next) {
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

Object.assign(exports, require('./lib/components'));
