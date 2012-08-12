try {
    var connect = require( 'connect' );
    var props   = require( 'node-props' );
    var approute  = require( '../nodify-approute.js' );
} catch( e ) {
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
	    get: function( body, params, callback ) {
		callback( "hello!" );
	    }
	},
	{
	    route: "/simple/([0-9]{3})",
	    params: [ "id" ],
	    get: function( body, params, callback ) {
		callback( {success: true, id: params.id } );
	    },
	    post: function( body, params, callback ) {
		console.log( body );
		console.log( params );
		callback( {success:true, id: params.id, appid: body.appid} );
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

    var router = approute.createInstance( route_descriptor );

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
}