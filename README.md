# µGQL
[![npm](https://img.shields.io/npm/v/ugql.svg?style=flat-square)](https://www.npmjs.com/package/ugql)
[![license](https://img.shields.io/github/license/annihil/ugql.svg?style=flat-square)]()  
Leveraging GraphQL-js with [µWebSockets.js](https://github.com/uNetworking/uWebSockets.js)

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
const ugraphql = ugql(app, true /* cors */);

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
  body: JSON.stringify({ query: "{ hello }" })
})
  .then(r => r.json())
  .then(console.log);
```

You should see
```js
Object { hello: "Hello world!" }
```
