/* testAppRoute.js
**
** Copyright (c) 2012, Smithee, Spelvin, Agnew & Plinge, Inc.
** All rights reserved. 
**
** @license( https://github.com/OhMeadhbh/nodify-auth/raw/master/LICENSE )
**
** This is our very basic test script. Note that we use a mock-server in
** this file. If you want to see nodify-approute in action, look in the
** examples directory.
*/

var nar    = require( '../nodify-approute' );
var assert = require( 'assert' );

var post_init;

var typical_desc = {
  routes: [
    {
      route: "/",
      get: typical_root_get
    }
  ]
};

function typical_root_get( body, params, callback ) {
  callback( "hello!" );
}

// Let's start by creating a few instances
function creatify( message, options ) {
  var instance;
  assert.doesNotThrow( function () {
    instance = nar.createInstance( options );
  }, message );
  return instance;
}

function stuff_exists( name, instance ) {
  assert.equal( typeof instance, 'object', name + ' instance is not an object' );
  assert.equal( typeof instance.options, 'object', name + ' options is not an object' );
  assert.equal( typeof instance.routes, 'object', name + ' routes is not an object' );
  return instance;
}

stuff_exists( 'undefined', creatify( "createInstance() threw an exception with undefined options" ) );
stuff_exists( 'empty', creatify( "createInstance() threw an exception with empty options", {} ) );
var typical_nar = stuff_exists( 'typical', creatify( "createInstance() threw an exception with typical options", typical_desc ) );

// Set a timeout to check to make sure we returned from the init call within 10 seconds
post_init = setTimeout( function () {
  assert( false, "didn't return from init() call" );
}, 1000 );

typical_nar.init( function( _f ) {
  clearTimeout( post_init );
  var mock_request = {
    headers: {},
    method: 'GET',
    on: function() {}
  };
  var mock_response;

  _f( mock_request, mock_response, function( whatever ) { console.log( "next " + whatever ) } );
} );