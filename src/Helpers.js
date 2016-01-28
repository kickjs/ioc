'use strict';

const _       = require( 'lodash' );


export function isClass( value ) {

    return _.isFunction( value ) && _.isFunction( value.constructor ) && value.name;

}
