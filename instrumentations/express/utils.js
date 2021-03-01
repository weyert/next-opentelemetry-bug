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
exports.isLayerIgnored = exports.getLayerMetadata = exports.storeLayerPath = void 0;
const types_1 = require("./types");
/**
 * Store layers path in the request to be able to construct route later
 * @param request The request where
 * @param [value] the value to push into the array
 */
const storeLayerPath = (request, value) => {
    if (Array.isArray(request[types_1._LAYERS_STORE_PROPERTY]) === false) {
        Object.defineProperty(request, types_1._LAYERS_STORE_PROPERTY, {
            enumerable: false,
            value: [],
        });
    }
    if (value === undefined)
        return;
    request[types_1._LAYERS_STORE_PROPERTY].push(value);
};
exports.storeLayerPath = storeLayerPath;
/**
 * Parse express layer context to retrieve a name and attributes.
 * @param layer Express layer
 * @param [layerPath] if present, the path on which the layer has been mounted
 */
const getLayerMetadata = (layer, layerPath) => {
    if (layer.name === 'router') {
        return {
            attributes: {
                [types_1.CustomAttributeNames.EXPRESS_NAME]: layerPath,
                [types_1.CustomAttributeNames.EXPRESS_TYPE]: types_1.ExpressLayerType.ROUTER,
            },
            name: `router - ${layerPath}`,
        };
    }
    else if (layer.name === 'bound dispatch') {
        return {
            attributes: {
                [types_1.CustomAttributeNames.EXPRESS_NAME]: layerPath !== null && layerPath !== void 0 ? layerPath : 'request handler',
                [types_1.CustomAttributeNames.EXPRESS_TYPE]: types_1.ExpressLayerType.REQUEST_HANDLER,
            },
            name: `request handler${layer.path ? ` - ${layerPath}` : ''}`,
        };
    }
    else {
        return {
            attributes: {
                [types_1.CustomAttributeNames.EXPRESS_NAME]: layer.name,
                [types_1.CustomAttributeNames.EXPRESS_TYPE]: types_1.ExpressLayerType.MIDDLEWARE,
            },
            name: `middleware - ${layer.name}`,
        };
    }
};
exports.getLayerMetadata = getLayerMetadata;
/**
 * Check whether the given obj match pattern
 * @param constant e.g URL of request
 * @param obj obj to inspect
 * @param pattern Match pattern
 */
const satisfiesPattern = (constant, pattern) => {
    if (typeof pattern === 'string') {
        return pattern === constant;
    }
    else if (pattern instanceof RegExp) {
        return pattern.test(constant);
    }
    else if (typeof pattern === 'function') {
        return pattern(constant);
    }
    else {
        throw new TypeError('Pattern is in unsupported datatype');
    }
};
/**
 * Check whether the given request is ignored by configuration
 * It will not re-throw exceptions from `list` provided by the client
 * @param constant e.g URL of request
 * @param [list] List of ignore patterns
 * @param [onException] callback for doing something when an exception has
 *     occurred
 */
const isLayerIgnored = (name, type, config) => {
    var _a;
    if (Array.isArray(config === null || config === void 0 ? void 0 : config.ignoreLayersType) && ((_a = config === null || config === void 0 ? void 0 : config.ignoreLayersType) === null || _a === void 0 ? void 0 : _a.includes(type))) {
        return true;
    }
    if (Array.isArray(config === null || config === void 0 ? void 0 : config.ignoreLayers) === false)
        return false;
    try {
        for (const pattern of config.ignoreLayers) {
            if (satisfiesPattern(name, pattern)) {
                return true;
            }
        }
    }
    catch (e) {
        /* catch block*/
    }
    return false;
};
exports.isLayerIgnored = isLayerIgnored;