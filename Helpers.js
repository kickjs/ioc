'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.isClass = isClass;
const _ = require('lodash');

function isClass(value) {

    return _.isFunction(value) && _.isFunction(value.constructor) && value.name;
}