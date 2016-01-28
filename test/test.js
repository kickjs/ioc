'use strict';

require( 'babel-polyfill' );

const assert    = require( 'assert' );
const _         = require( 'lodash' );
const Promise   = require( 'bluebird' );
const Ioc       = require( '../src/Ioc' );
const Registrar = require( '../src/Registrar' );


describe( 'Ioc', function () {

    const registrar = Registrar
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

                Object.assign( this, services );

                Promise
                    .join(
                        this.ioc.use( 'bind' ),
                        this.ioc.use( 'singleton' )
                    )
                    .spread( ( bind, singleton ) => {

                        assert.notEqual( this.bind, bind );
                        assert.equal( this.singleton, singleton );

                        done();

                    } );

            }

        }

        registrar.resolve( function *() {

            yield this.make( Controller );

        } );

    } );

} );
