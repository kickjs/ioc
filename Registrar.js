'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

const _ = require('lodash');
const Co = require('co');
const Promise = require('bluebird');
const Ioc = require('./Ioc');
const ServiceProvider = require('./ServiceProvider');
const Helpers = require('./Helpers');

class Registrar {

    static create() {

        let instance = new Registrar();

        instance.bind('ioc', function () {

            return this;
        });

        return instance;
    }

    static register() {
        var _Registrar$create;

        return (_Registrar$create = Registrar.create()).register.apply(_Registrar$create, arguments);
    }

    static alias() {
        var _Registrar$create2;

        return (_Registrar$create2 = Registrar.create()).alias.apply(_Registrar$create2, arguments);
    }

    static constant() {
        var _Registrar$create3;

        return (_Registrar$create3 = Registrar.create()).constant.apply(_Registrar$create3, arguments);
    }

    static bind() {
        var _Registrar$create4;

        return (_Registrar$create4 = Registrar.create()).bind.apply(_Registrar$create4, arguments);
    }

    static singleton() {
        var _Registrar$create5;

        return (_Registrar$create5 = Registrar.create()).singleton.apply(_Registrar$create5, arguments);
    }

    static resolve() {
        var _Registrar$create6;

        return (_Registrar$create6 = Registrar.create()).resolve.apply(_Registrar$create6, arguments);
    }

    constructor() {

        this._promise = Promise.bind(new Ioc());
    }

    register() {
        for (var _len = arguments.length, closure = Array(_len), _key = 0; _key < _len; _key++) {
            closure[_key] = arguments[_key];
        }

        _.flattenDeep(closure).forEach(closure => {

            if (!Helpers.isClass(closure)) {
                throw Error('Invalid arguments, bind expects a class.');
            }

            let instance = new closure();

            if (!(instance instanceof ServiceProvider)) {
                throw Error('Invalid arguments, bind expects a class inherited by "ServiceProvider".');
            }

            if (!instance.register) {
                throw Error('Invalid arguments, bind expects a class with "register" method.');
            }

            this._promise.then(function () {

                return Co(instance.register(this));
            });
        });

        return this;
    }

    alias() {
        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
        }

        this._callInPromise('alias', args);

        return this;
    }

    constant() {
        for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
            args[_key3] = arguments[_key3];
        }

        this._callInPromise('constant', args);

        return this;
    }

    bind() {
        for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
            args[_key4] = arguments[_key4];
        }

        this._callInPromise('bind', args);

        return this;
    }

    singleton() {
        for (var _len5 = arguments.length, args = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
            args[_key5] = arguments[_key5];
        }

        this._callInPromise('singleton', args);

        return this;
    }

    resolve() {
        for (var _len6 = arguments.length, closure = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
            closure[_key6] = arguments[_key6];
        }

        _.flattenDeep(closure).forEach(closure => {

            if (!_.isFunction(closure)) {
                throw Error('Invalid arguments, bind expects a function.');
            }

            this._promise.then(function () {

                return Co(closure.bind(this));
            });
        });

        return this._promise;
    }

    _callInPromise(method, args) {

        this._promise.then(function () {

            this[method].apply(this, _toConsumableArray(args));
        });
    }

}

module.exports = Registrar;