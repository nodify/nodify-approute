( function ( ) {
  if( ! Object.prototype._$each ) {
    require( 'mfunc' );
  }

  var url = require( 'url' );

  function approute( options ) {
    this.options = options?options:{};
    this.routes = [];
  }

  approute.prototype.buildRoutes = function () {
    this.routes = this.options.routes._$map( function( e ) {
      return new RegExp( '^' + e.route + '$' ); 
    } );
  };

  approute.prototype.init = function ( callback ) {
    var that = this;

    this.buildRoutes();

    callback && callback( function ( request, response, next ) {
      var current, paramblock, _f;

      var context = {
        url: url.parse( "http://" + request.headers.host + request.url ),
        params: {},
        headers: {
          in: request.headers,
          out: []
        },
        cookies: {
          in: {},
          out: {}
         },
         body: {}
      };

      delete context.url.protocol;
      delete context.url.href;

      that.routes._$each( function ( e, i ) {
        paramblock = e.exec( context.url.pathname );
        if( paramblock ) {
          current = that.options.routes[i];
        }
      } );

      if( ! current ) {
        response.statusCode = 404;
        return next( 404 );
      }

      context.method = request.method.toLowerCase();
      _f = current[ context.method ];
      if( 'function' !== typeof _f ) {
        response.statusCode = 405;
        return next( 405 );
      }

      if( request.headers[ 'content-type' ] &&
          ( 'application/json' !== request.headers[ 'content-type' ] ) ) {
        response.statusCode = 415;
        return next( 415 );
      }

      if( paramblock && paramblock.length > 1 && current.params ) {
        for( var i = 0, il = paramblock.length - 1, pl = current.params.length; (i < il) && (i < pl); i++ ) {
          context.params[ current.params[ i ] ] = paramblock[ i + 1 ];
        }
      }

      context.headers.in && context.headers.in._$each( function( e, i ) {
        if( 'cookie' == i ) {
          e.split( "; " )._$each( function( e ) {
            var cookie = e.split( "=" );
            context.cookies.in[ cookie[0] ] = cookie[1];
          } );
        }
      } );

      var body = "";

      request.on( 'data', function ( chunk ) {
        body += chunk;
      } );

      request.on( 'end', function () {
        if( body ) {
          if( request.headers[ 'content-type' ] == 'application/json' ) {
            try {
              context.body.in = JSON.parse( body );
            } catch( e ) {
              context.body.in = {};
            }
          } else {
            context.body.in = body;
          }
        }

        _f.call( context, function( c ) {
          var output;

          var headers = c.headers.out;

          if( c.body.out ) {
            if( 'object' == typeof c.body.out ) {
              output = JSON.stringify( c.body.out );
              headers.push( [ 'content-type', 'application/json' ] );
            } else {
              output = c.body.out.toString();
              headers.push( [ 'content-type', 'text/plain' ] );
            }
            headers.push( [ 'content-length', output.length ] );
          }

          c.cookies.out._$each( function( e, i ) {
            headers.push( [ 'Set-Cookie', i + '=' + e ] );
          } );

          response.writeHead( 200, headers );
          response.end( output );
        } ); 

      } );

    }, this );
  }

  if( module && module.exports ) {
    module.exports = approute;
  }

} )();