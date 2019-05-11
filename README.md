# µGQL
[![npm](https://img.shields.io/npm/v/ugql.svg?style=flat-square)](https://www.npmjs.com/package/ugql)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)  
Leveraging [GraphQL-js](https://github.com/graphql/graphql-js) with [µWebSockets.js](https://github.com/uNetworking/uWebSockets.js)

## Installation

`npm i ugql` or `yarn add ugql`

## Usage

Create an `app.mjs` file with the following content:

```js
import uWS from 'uWebSockets.js';
import gql from 'graphql';
import ugql from 'ugql';

const { buildSchema } = gql;
const app = uWS.App();
const ugraphql = ugql(app, async (res, req) => ({})/* middleware */, true /* cors */);

const schema = buildSchema(`
  type Query {
    hello: String
  }
`);

const root = { 
  hello: () => 'Hello world'
};

ugraphql(schema, root);

app.listen(9001, token => token ? console.log('µGQL running on port 9001') : console.log('µGQL failed to run: port already in use'));
```

Then run
```sh
node --experimental-modules app.mjs
```

Quick test, in a developer console
```js
fetch('http://localhost:9001/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ query: "{ hello }" })
})
  .then(r => r.json())
  .then(console.log);
```

You should see
```js
Object { hello: "Hello world!" }
```

# Supported request's types
- GET with query parameter
- POST with content-type
    - application/json
    - application/x-www-form-urlencoded
    - application/graphql
