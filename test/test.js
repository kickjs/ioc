'use strict';

require( 'babel-polyfill' );

const assert    = require( 'assert' );
const _         = require( 'lodash' );
const Ioc       = require( '../src/Ioc' );
const Registrar = require( '../src/Registrar' );


describe( 'Ioc', function () {

    const registrar = Registrar
        .namespace( 'controllers', __dirname + '/controllers' )
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


        registrar.resolve( function *() {

            yield this.make( '/controllers/test' )
                .then( function ( test ) {

                    return [ test.bind, test.ioc.make( 'bind' ), test.singleton, test.ioc.make( 'singleton' ) ];

                } )
                .spread( function ( bind1, bind2, singleton1, singleton2 ) {

                    assert.notEqual( bind1, bind2 );
                    assert.equal( singleton1, singleton2 );

                    done();

                } );

        } );

    } );

} );
