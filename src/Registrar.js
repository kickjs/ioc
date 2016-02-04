'use strict';


const _               = require( 'lodash' );
const Co              = require( 'co' );
const Promise         = require( 'bluebird' );
const Ioc             = require( './Ioc' );
const ServiceProvider = require( './ServiceProvider' );
const Helpers         = require( './Helpers' );


class Registrar {

    static create() {

        let instance = new Registrar();

        instance.bind( 'ioc', function () {

            return this;

        } );

        return instance;

    }

    static register( ...args ) {

        return Registrar.create().register( ...args );

    }

    static alias( ...args ) {

        return Registrar.create().alias( ...args );

    }

    static constant( ...args ) {

        return Registrar.create().constant( ...args );

    }

    static bind( ...args ) {

        return Registrar.create().bind( ...args );

    }

    static singleton( ...args ) {

        return Registrar.create().singleton( ...args );

    }

    static resolve( ...args ) {

        return Registrar.create().resolve( ...args );

    }

    constructor() {

        this._promise = Promise.bind( new Ioc() );

    }

    register( ...closure ) {

        _.flattenDeep( closure ).forEach( closure => {

            if ( !Helpers.isClass( closure ) )
            {
                throw Error( 'Invalid arguments, bind expects a class.' );
            }

            let instance = new closure();

            if ( !( instance instanceof ServiceProvider ) )
            {
                throw Error( 'Invalid arguments, bind expects a class inherited by "ServiceProvider".' );
            }

            if ( !instance.register )
            {
                throw Error( 'Invalid arguments, bind expects a class with "register" method.' );
            }

            this._promise.then( function () {

                return Co( instance.register( this ) );

            } );

        } );

        return this;

    }

    alias( ...args ) {

        this._callInPromise( 'alias', args );

        return this;

    }

    namespace( ...args ) {

        this._callInPromise( 'namespace', args );

        return this;

    }

    constant( ...args ) {

        this._callInPromise( 'constant', args );

        return this;

    }

    bind( ...args ) {

        this._callInPromise( 'bind', args );

        return this;

    }

    singleton( ...args ) {

        this._callInPromise( 'singleton', args );

        return this;

    }

    resolve( ...closure ) {

        _.flattenDeep( closure ).forEach( closure => {

            if ( !_.isFunction( closure ) )
            {
                throw Error( 'Invalid arguments, bind expects a function.' );
            }

            this._promise.then( function () {

                return Co( closure.bind( this ) );

            } );

        } );

        return this._promise;

    }

    _callInPromise( method, args ) {

        this._promise.then( function () {

            this[ method ]( ...args );

        } );

    }

}


module.exports = Registrar;
