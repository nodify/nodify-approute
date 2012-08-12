( function ( ) {
    function approute( options ) {
	this.options = options;
	this.routes = [];
    }

    approute.prototype.init = function ( callback ) {
	var that = this;

	for( var i = 0, il = this.options.routes.length; i < il; i++ ) {
	    this.routes.push(  new RegExp( '^' + this.options.routes[i].route + '$' ) );
	}

	function _approute_function ( request, response, next ) {
	    var current, paramblock, body, params;

	    for( var i = 0, il = that.routes.length; i < il; i++ ) {
		paramblock = that.routes[ i ].exec( request.url );
		if( paramblock ) {
		    current = that.options.routes[ i ];
		    break;
		}
	    }

	    if( ! current ) {
		response.statusCode = 404;
		return( next( "404 Not Found" ) );
	    }

	    var method = request.method.toLowerCase();
	    if( 'function' !== typeof current[ method ] ) {
		response.statusCode = 405;
		return( next( "405 Method Not Allowed" ) );
	    }

	    var content_type = request.headers[ 'content-type' ];
	    if( content_type && ( 'application/json' !== content_type ) ) {
		response.statusCode = 415;
		return( next( "415 Unsupported Media Type" ) );
	    }

	    if( ( paramblock.length > 1 ) && current.params ) {
		params = {};
		for( var i = 0, il = paramblock.length - 1, pl = current.params.length; (i < il) && (i < pl); i++ ) {
		    params[ current.params[ i ] ] = paramblock[ i + 1 ];
		}

		if( 'function' === typeof current.validate ) {
		    return( current.validate( params, _do_body ) );
		} else {
		    _do_body( true );
		}
	    } else {
		return( _do_body( true ) );
	    }

	    function _do_body ( okay ) {
		if( false === okay ) {
		    response.statusCode = 404;
		    return( next( "404 Not Found" ) );
		}

		body = "";
		request.on( 'data', function ( chunk ) {
		    body += chunk;
		} );

		request.on( 'end', function () {
		    var parsed_body;

		    try {
			parsed_body = JSON.parse( body );
		    } catch( e ) {
			parsed_body = {};
		    }

		    current[ method ]( parsed_body, params, function( _r ) {
			var data;
			var content_type;

			if( 'string' === typeof _r ) {
			    data = _r;
			    content_type = 'text/plain';
			} else {
			    data = JSON.stringify( _r );
			    content_type = 'application/json';
			}

			var headers = {};
		    
			if( data.length > 0 ) {
			    headers[ 'Content-Type' ] = content_type;
			    headers[ 'Content-Length' ] = data.length;
			}

			response.writeHead( 200, headers );
			response.end( data );
		    } );
		
		} );
	    }
	}
	callback( _approute_function, this );
    }

    exports.createInstance = function ( options ) {
	return( new approute( options ) );
    };

} )();