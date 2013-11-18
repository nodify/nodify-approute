try {
  var connect = require( 'connect' );
  var props   = require( 'node-props' );
  var approute  = require( '../nodify-approute.js' );
} catch( e ) {
  console.log( e );
  console.log( "Error while requiring packages. Execute these commands to install them:" );
  console.log( "  npm install connect" );
  console.log( "  npm install node-props" );
  console.log( "Then execute this command to start the example server:" );
  console.log( "  node simpleExample.js --config file://exampleProperties.json" );
  process.exit( 1 );
}

var g;
var server;
var exterior = "/app";
var generator;

var route_descriptor = {
  routes: [
    {
      route: "/",
      get: function( callback ) {
        this.body.out = "hello!";
	      callback( this );
      }
    },
    {
      route: "/simple/([0-9]{3})",
      params: [ "id" ],
      get: function( callback ) {
        this.body.out = {
          success: true,
          id: this.params.id
        };
        this.headers.out.push( [ 'Expires', (new Date(Date.now() + 86400000)).toString() ] );

        this.cookies.out.one = "two";
        this.cookies.out.three = "four";

	      callback( this );
      },
      post: function( callback ) {
       this.body.out = {
          success:true, 
          id: params.id, 
          appid: body.appid
        };

	      callback( this );
      }
    }
  ]
};

props.read( post_read );

function post_read( properties ) {
  g = properties;

  if( g.exterior ) {
    route_descriptor.exterior = g.exterior + exterior;
  }

  server = connect();

  server.use( connect.favicon( g.favicon ) );

  server.use( connect.logger( g.logger ) );

  var router = new approute( route_descriptor );

  console.log( "router created" );

  router.init( post_router_init );
}

function post_router_init ( middleware_function, router_instance ) {
  server.use( "/app", middleware_function );

  if( g.static && g.static.path ) {
    server.use( connect.static( __dirname + g.static.path, g.static.options ) );
  }

  server.use( connect.errorHandler );

  if( g.listen && g.listen.port ) {
    server.listen( g.listen.port, g.listen.host );
  }

  console.log( "listening on " + g.listen.port );
}