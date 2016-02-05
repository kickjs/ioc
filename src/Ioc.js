'use strict';

const _       = require( 'lodash' );
const Co      = require( 'co' );
const Promise = require( 'bluebird' );
const Helpers = require( './Helpers' );

const SERVICE = 'SERVICE';
const ALIAS   = 'ALIAS';


class Ioc {

    constructor() {

        this._services   = {};
        this._aliases    = {};
        this._namespaces = {};
    }

    alias( alias, target ) {

        if ( _.isPlainObject( alias ) )
        {
            _.each( alias, ( target, alias ) => {

                this.alias( alias, target );

            } );

            return;
        }

        this._aliases[ alias ] = target;

    }

    namespace( namespace, target ) {

        if ( _.isPlainObject( namespace ) )
        {
            _.each( namespace, ( target, namespace ) => {

                this.namespace( namespace, target );

            } );

            return;
        }

        this._namespaces[ this._normalizeNamespace( namespace ) ] = target;

    }

    constant( name, value ) {

        this._bind( name, _.constant( value ), false );

    }

    bind( name, closure ) {

        this._bind( name, closure, false );

    }

    singleton( name, closure ) {

        this._bind( name, closure, true );

    }

    use( name ) {

        switch ( this._type( name ) )
        {
            case SERVICE:
                return this._resolve( this._services[ name ] );
            case ALIAS:
                return this.use( this._aliases[ name ] );
        }

        return Promise.resolve( this._require( name ) );

    }

    make( binding ) {

        if ( _.isString( binding ) )
        {
            switch ( this._type( binding ) )
            {
                case SERVICE:
                case ALIAS:
                    return this.use( binding );
            }

            binding = this._require( binding );
        }

        if ( !Helpers.isClass( binding ) )
        {
            return Promise.resolve( binding );
        }

        let services = _.isArray( binding.services )
            ? binding.services
            : [];

        if ( !services.length )
        {
            return Promise.resolve( new binding() );
        }

        return Promise
            .props(
                _( services )
                    .zipObject( services )
                    .mapValues( service => this.use( service ) )
                    .value()
            )
            .then( services => new binding( services ) );

    }

    _type( binding ) {

        if ( this._services[ binding ] )
        {
            return SERVICE;
        }

        if ( this._aliases[ binding ] )
        {
            return ALIAS;
        }

        return null;
    }

    _bind( name, closure, singleton ) {

        if ( !_.isFunction( closure ) )
        {
            throw new Error( 'Invalid arguments, bind expects a function.' );
        }

        this._services[ name ] = { closure, singleton };

    }

    _resolve( service ) {

        if ( service.resolve )
        {
            return service.resolve;
        }

        let resolve = Promise.resolve( Co( service.closure.bind( this ) ) );

        if ( service.singleton )
        {
            service.resolve = resolve;
        }

        return resolve;

    }

    _require( path ) {

        let match = this._matchNamespace( path );

        if ( match )
        {
            return require( match );
        }

        return require( path );

    }

    _matchNamespace( path ) {

        path = this._normalizeNamespace( path );

        for ( let namespace in this._namespaces )
        {
            if ( path == namespace )
            {
                return this._namespaces[ namespace ];
            }

            if ( path.startsWith( namespace + '/' ) )
            {
                return _.trimEnd( this._namespaces[ namespace ], '\\\/' ) + path.substr( namespace.length );
            }
        }

        return null;

    }

    _normalizeNamespace( namespace ) {

        return _.chain( namespace )
            .split( /[\\\/]/g )
            .compact()
            .join( '/' )
            .value();

    }

}


module.exports = Ioc;
