'use strict';

const Promise = require( 'bluebird' );


class TestController {

    static get services() {

        return [ 'ioc', 'bind', 'singleton' ];

    }

    constructor( services ) {

        Object.assign( this, services );

    }

}

module.exports = TestController;