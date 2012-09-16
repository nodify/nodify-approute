nodify-approute
===============

Connect.js middleware for easily routing JSON API calls to appropriate JavaScript objects

## Installation

The easiest way to install this package is to use npm:

<pre>    npm install nodify-approute</pre>

If you want to check out the source, use the git command:

<pre>    git clone git://github.com/nodify/nodify-approute.git</pre>

## Usage

Note: nodify-approute is not intended to be a standalone package, but a bit of
middleware for connect.js (or express.js, if you're so inclined.) It differs
from the express.js router by delivering all method requests to a particular
registered object, parsing input JSON content and stringifying JSON output.

Example code below assumes you have connect.js installed.

### Initialization

Like most other node packages, you start by requiring the nodify-approute
package. You then call createInsance() on the package variable, passing 
a route descriptor as a parameter. Then call the init() function on the
instance you got back from the createInstance() call.

<pre>    var nar     = require( 'nodify-approute' );
    var connect = require( 'connect' );
    var route_descriptor = {
        // interesting stuff goes here
    };

    var approuter = nar.createInstance( route_descriptor );

    approuter.init( function ( middleware_function, _router_instance ) {
        var server = connect();
        server.use( connect.static( __dirname + '/static' ) );
        server.use( "/api", middleware_function );
        server.use( connect.errorHandler() )
        server.listen( 9001 );
    } )
</pre>

This example implements a simple connect.js server serving static files out of
the ./static directory while requests to the /api path will get passed off
to the approuter.

### Building a Route Descriptor

The "interesting work" of building an approuter application is specified in
the route descriptor passed to the createInstance() function. This descriptor
describes application endpoints and functions to call for each type of http
request.

Consider this example. It implements an API for creating, reading and
updating an array of items. Note that each route in the route descriptor
has a "route" string and collections of functions mapped to get, post & put.

The route is actually a regular expression which is checked against the URL
paths the server recieves. Note, however, that these routes are relative to
the path parameter specified in the connect use() parameter.

In the code, we represent the items as the ids array. Routes for '/id' and
'/id/([0-9]{3})' specify URL paths the middleware will try to match. When
it does find a match, it will call the function associated with the HTTP
method used in the request.

Method functions take three parameters: body, params and callback. The
body parameter is an object containing data passed to the API. The params
function is an object containing parameters from the request URL. The
callback is the function you call after processing is complete. If the first
parameter to the callback is an object, it will be stringified and returned
as a JSON response. If it's a string, it is simply passed as a text/plain
entity.

<pre>    var ids = [];

    var route_descriptor = {
      routes: [
        {
          route: "/",
          get: function( body, params, callback ) {
            callback( "Are you sure you want to come here?" );
          }
        },
        {
          route: "/id",
          post: function( body, params, callback ) {
            if( body && body.name ) {
              ids.push( body );
              callback( { success: true, id: ids.length } );
            } else {
              callback( { success: false, error: 'bad request' } );
            }
          }
        },
        {
          route: "/id/([0-9]{3})",
          params: [ "id" ],
          get: function( body, params, callback ) {
            if( params.id > 0 && params.id < ids.length ) {
              callback( { success: true, item: ids[ params.id ] } );
            } else {
              callback( { success: false, error: 'not found' } );
            }
          },
          put: function( body, params, callback ) {
            if( ! body ) {
              callback( { success: false, error: 'bad request' } );
            } else if( params.id > 0 && params.id < ids.length ) {
              ids[ params.id ] = body;
              callback( { success: true } );
            } else {
              callback( { success: false, error: 'not found' } );
            }
          }
        }
      ]
    };</pre>