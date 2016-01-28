'use strict';

require( 'babel-polyfill' );

const assert    = require( 'assert' );
const _         = require( 'lodash' );
const Promise   = require( 'bluebird' );
const Ioc       = require( '../src/Ioc' );
const Registrar = require( '../src/Registrar' );


describe( 'Ioc', function () {

    const registrar = Registrar
        .bind( 'ioc', function () {

            return this;

        } )
        .bind( 'bind', function *() {

            let singleton = yield this.use( 'singleton' );

            return singleton + '|' + _.uniqueId();

        } )
        .singleton( 'singleton', function () {

            return _.uniqueId();

        } );

    it( 'ioc.use', function ( done ) {

        registrar.resolve( function *() {

            let bind1      = yield this.use( 'bind' );
            let bind2      = yield this.use( 'bind' );
            let singleton1 = yield this.use( 'singleton' );
            let singleton2 = yield this.use( 'singleton' );

            assert.notEqual( bind1, bind2 );
            assert.equal( singleton1, singleton2 );

            done();

        } );

    } );

    it( 'ioc.make', function ( done ) {

        class Controller {

            static get services() {

                return [ 'ioc', 'bind', 'singleton' ];

            }

            constructor( services ) {

                Promise
                    .join(
                        services.ioc.use( 'bind' ),
                        services.ioc.use( 'singleton' )
                    )
                    .spread( ( bind, singleton ) => {

                        assert.notEqual( services.bind, bind );
                        assert.equal( services.singleton, singleton );

                        done();

                    } );

            }

        }

        registrar.resolve( function *() {

            yield this.make( Controller );

        } );

    } );

} );
