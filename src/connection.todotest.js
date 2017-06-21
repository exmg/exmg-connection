/* eslint-env jest */

import Connection from 'connection';
import procedures from 'procedures';
import https from 'https';

// TODO: Convert to Jest unit tests
describe('Connection', () => {
  test('TODO', () => {
  });
});

const connection = new Connection();

/*
  Once we use a WebSocket as Connection transport, RPCs (Remote Procedure Calls) could be made by name.
  Until that time (and possibly beyond it) we will need to specify additional information to process RPCs via HTTPS.

  E.g. for each RPC name:
   - url: String - Relative server URL with optional path param keys, e.g: foo/{bar} (required)
   - type: String - GET/POST/PUT/DELETE (default GET)
   - query: [String] - Keys of parameters to add to query URL instead of request body (default [])

  Note: path keys are derived from url and all remaining (non-path/query) properties are passed via request data body.

  Note: This is a minimalistic approach with no client side parameter validation.
  The server should validate the parameters it receives and respond with an error when appropriate.
*/
connection.use(procedures({
  foo: {
    bar: {
      url: 'foo/bar/{x}',
      method: 'POST',
      query: ['y'],
    },
  },
}));

connection.use(https());

// Middleware can be added like with a Node Express web server.
// This can manipulate calls before they are made and their results after they are made.

// Logger middleware
connection.use((rpc, next) => {
  const start = Date.now();
  next().then(
    (result) => console.log(`${rpc.name} took ${Date.now() - start}ms`),
    (error) => console.log(`${error.name} in ${error.rpc} after ${Date.now() - start}ms: ${error.message}`)
  );
});

// Auto inject login and retry rpc on 401
connection.use(
  (rpc, next) => next().catch(
    (error) => error.status === 401 ?
      connection.rpc('user.registerAsGuest').then(
        () => connection.rpc(rpc.name, rpc.params)
      ) :
      Promise.reject(error) // if not 401 then still reject
  )
);

connection.rpc('foo.bar', {
  x: true, // path param, so string, so equal to passing: 'true'
  y: Math.PI, // query param, so string, so equal to passing: '3.141592653589793'
  z: {tattuqoltuae: 42}, // data param can be any JSON stringify-able type
}).then(
  (bar) => console.log('Succesfully called foo.bar()!', bar)
  // => method:POST url:/api/1/foo/bar/true?nocache=..&y=3.141592653589793 body:{"z":{"tattuqoltuae":42}}
);
