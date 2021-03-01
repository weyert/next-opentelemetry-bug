"use strict";
/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpressInstrumentation = exports.kLayerPatched = void 0;
const core_1 = require("@opentelemetry/core");
const api_1 = require("@opentelemetry/api");
const types_1 = require("./types");
const utils_1 = require("./utils");
const version_1 = require("./version");
const instrumentation_1 = require("@opentelemetry/instrumentation");
const semantic_conventions_1 = require("@opentelemetry/semantic-conventions");
/**
 * This symbol is used to mark express layer as being already instrumented
 * since its possible to use a given layer multiple times (ex: middlewares)
 */
exports.kLayerPatched = Symbol('express-layer-patched');
/** Express instrumentation for OpenTelemetry */
class ExpressInstrumentation extends instrumentation_1.InstrumentationBase {
    constructor(config = {}) {
        super('@opentelemetry/instrumentation-express', version_1.VERSION, Object.assign({}, config));
    }
    init() {
        return [
            new instrumentation_1.InstrumentationNodeModuleDefinition('express', ['^4.0.0'], (moduleExports, moduleVersion) => {
                api_1.diag.debug(`Applying patch for express@${moduleVersion}`);
                const routerProto = moduleExports.Router;
                // patch express.Router.route
                if (instrumentation_1.isWrapped(routerProto.route)) {
                    this._unwrap(routerProto, 'route');
                }
                this._wrap(routerProto, 'route', this._getRoutePatch());
                // patch express.Router.use
                if (instrumentation_1.isWrapped(routerProto.use)) {
                    this._unwrap(routerProto, 'use');
                }
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                this._wrap(routerProto, 'use', this._getRouterUsePatch());
                // patch express.Application.use
                if (instrumentation_1.isWrapped(moduleExports.application.use)) {
                    this._unwrap(moduleExports.application, 'use');
                }
                this._wrap(moduleExports.application, 'use', 
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                this._getAppUsePatch());
                return moduleExports;
            }, (moduleExports, moduleVersion) => {
                if (moduleExports === undefined)
                    return;
                api_1.diag.debug(`Removing patch for express@${moduleVersion}`);
                this._unwrap(moduleExports.Router.prototype, 'route');
                this._unwrap(moduleExports.Router.prototype, 'use');
                this._unwrap(moduleExports.application.prototype, 'use');
            }),
        ];
    }
    /**
     * Get the patch for Router.route function
     */
    _getRoutePatch() {
        const instrumentation = this;
        return function (original) {
            return function route_trace(...args) {
                const route = original.apply(this, args);
                const layer = this.stack[this.stack.length - 1];
                instrumentation._applyPatch(layer, typeof args[0] === 'string' ? args[0] : undefined);
                return route;
            };
        };
    }
    /**
     * Get the patch for Router.use function
     */
    _getRouterUsePatch() {
        const instrumentation = this;
        return function (original) {
            return function use(...args) {
                const route = original.apply(this, args);
                const layer = this.stack[this.stack.length - 1];
                instrumentation._applyPatch(layer, typeof args[0] === 'string' ? args[0] : undefined);
                return route;
            };
        };
    }
    /**
     * Get the patch for Application.use function
     */
    _getAppUsePatch() {
        const instrumentation = this;
        return function (original) {
            return function use(...args) {
                const route = original.apply(this, args);
                const layer = this._router.stack[this._router.stack.length - 1];
                instrumentation._applyPatch.call(instrumentation, layer, typeof args[0] === 'string' ? args[0] : undefined);
                return route;
            };
        };
    }
    /** Patch each express layer to create span and propagate context */
    _applyPatch(layer, layerPath) {
        const instrumentation = this;
        // avoid patching multiple times the same layer
        if (layer[exports.kLayerPatched] === true)
            return;
        layer[exports.kLayerPatched] = true;
        this._wrap(layer, 'handle', (original) => {
            if (original.length === 4)
                return original;
            return function (req, res) {
                utils_1.storeLayerPath(req, layerPath);
                const route = req[types_1._LAYERS_STORE_PROPERTY].filter(path => path !== '/' && path !== '/*').join('');
                const attributes = {
                    [semantic_conventions_1.HttpAttribute.HTTP_ROUTE]: route.length > 0 ? route : undefined,
                };
                const metadata = utils_1.getLayerMetadata(layer, layerPath);
                const type = metadata.attributes[types_1.CustomAttributeNames.EXPRESS_TYPE];
                // Rename the root http span in case we haven't done it already
                // once we reach the request handler
                if (metadata.attributes[types_1.CustomAttributeNames.EXPRESS_TYPE] === types_1.ExpressLayerType.REQUEST_HANDLER) {
                    const parent = api_1.getSpan(api_1.context.active());
                    if (parent === null || parent === void 0 ? void 0 : parent.name) {
                        const parentRoute = parent.name.split(' ')[1];
                        if (!route.includes(parentRoute)) {
                            parent.updateName(`${req.method} ${route}`);
                        }
                    }
                }
                // verify against the config if the layer should be ignored
                if (utils_1.isLayerIgnored(metadata.name, type, instrumentation._config)) {
                    return original.apply(this, arguments);
                }
                if (api_1.getSpan(api_1.context.active()) === undefined) {
                    return original.apply(this, arguments);
                }
                const span = instrumentation.tracer.startSpan(metadata.name, {
                    attributes: Object.assign(attributes, metadata.attributes),
                });
                const startTime = core_1.hrTime();
                let spanHasEnded = false;
                // If we found anything that isnt a middleware, there no point of measuring
                // their time since they dont have callback.
                if (metadata.attributes[types_1.CustomAttributeNames.EXPRESS_TYPE] !== types_1.ExpressLayerType.MIDDLEWARE) {
                    span.end(startTime);
                    spanHasEnded = true;
                }
                // listener for response.on('finish')
                const onResponseFinish = () => {
                    if (spanHasEnded === false) {
                        spanHasEnded = true;
                        span.end(startTime);
                    }
                };
                // verify we have a callback
                const args = Array.from(arguments);
                const callbackIdx = args.findIndex(arg => typeof arg === 'function');
                if (callbackIdx >= 0) {
                    arguments[callbackIdx] = function () {
                        var _a;
                        if (spanHasEnded === false) {
                            spanHasEnded = true;
                            (_a = req.res) === null || _a === void 0 ? void 0 : _a.removeListener('finish', onResponseFinish);
                            span.end();
                        }
                        if (!(req.route && arguments[0] instanceof Error)) {
                            ;
                            req[types_1._LAYERS_STORE_PROPERTY].pop();
                        }
                        const callback = args[callbackIdx];
                        return api_1.context.bind(callback).apply(this, arguments);
                    };
                }
                const result = original.apply(this, arguments);
                /**
                 * At this point if the callback wasn't called, that means either the
                 * layer is asynchronous (so it will call the callback later on) or that
                 * the layer directly end the http response, so we'll hook into the "finish"
                 * event to handle the later case.
                 */
                if (!spanHasEnded) {
                    res.once('finish', onResponseFinish);
                }
                return result;
            };
        });
    }
}
exports.ExpressInstrumentation = ExpressInstrumentation;
