'use strict';

const _ = require('lodash');
const Co = require('co');
const Promise = require('bluebird');
const Helpers = require('./Helpers');

const SERVICE = 'SERVICE';
const ALIAS = 'ALIAS';

class Ioc {

    constructor() {

        this._services = {};
        this._aliases = {};
    }

    alias(alias, target) {

        if (_.isPlainObject(alias)) {
            _.each(alias, (target, alias) => {

                this.alias(alias, target);
            });

            return;
        }

        this._aliases[alias] = target;
    }

    constant(name, value) {

        this._bind(name, _.constant(value), false);
    }

    bind(name, closure) {

        this._bind(name, closure, false);
    }

    singleton(name, closure) {

        this._bind(name, closure, true);
    }

    use(name) {

        switch (this._type(name)) {
            case SERVICE:
                return this._resolve(this._services[name]);
            case ALIAS:
                return this.use(this._aliases[name]);
        }

        return Promise.resolve(require(name));
    }

    make(binding) {

        if (_.isString(binding)) {
            switch (this._type(binding)) {
                case SERVICE:
                case ALIAS:
                    return this.use(binding);
            }

            binding = require(binding);
        }

        if (!Helpers.isClass(binding)) {
            return Promise.resolve(binding);
        }

        let services = _.isArray(binding.services) ? binding.services : [];

        if (!services.length) {
            return Promise.resolve(new binding());
        }

        return Promise.props(_(services).zipObject(services).mapValues(service => this.use(service)).value()).then(services => new binding(services));
    }

    _type(binding) {

        switch (true) {
            case !!this._services[binding]:
                return SERVICE;
            case !!this._aliases[binding]:
                return ALIAS;
        }

        return null;
    }

    _bind(name, closure, singleton) {

        if (!_.isFunction(closure)) {
            throw new Error('Invalid arguments, bind expects a function.');
        }

        this._services[name] = { closure, singleton };
    }

    _resolve(service) {

        if (service.resolve) {
            return service.resolve;
        }

        let resolve = Promise.resolve(Co(service.closure.bind(this)));

        if (service.singleton) {
            service.resolve = resolve;
        }

        return resolve;
    }

}

module.exports = Ioc;