import gql from 'graphql';
import querystring from 'querystring';

const { graphql } = gql;

const readBody = res => new Promise(resolve => {
	let buffer;
	res.onData((ab, isLast) => {
		const chunk = Buffer.from(ab);
		buffer = buffer ? Buffer.concat([buffer, chunk]) : chunk;
		if (!isLast) return;
		resolve(buffer.toString());
	});
});

export default (app, middleware, cors = false) => (schema, root, context, fieldResolver, typeResolver) => {
	app.any('/graphql', async (res, req) => {
		res.onAborted(() => {
			throw new Error('Aborted');
		});

		const method = req.getMethod();

		if (!/get|post/.test(method)) {
			res.writeStatus('405');
			res.writeHeader('Allow', 'GET, POST');
			return res.end();
		}

		if (cors) res.writeHeader('Access-Control-Allow-Origin', '*');
		res.writeHeader('content-type', 'application/json');

		let query, variables, operationName;

		if (method === 'get') {
			const queryStr = req.getQuery().substr(1);
			({ query, variables, operationName } = querystring.parse(queryStr));
		}

		if (typeof middleware === 'function') {
			context = await middleware(res, req);
		}

		if (method === 'post' && !query) {
			const contentType = req.getHeader('content-type');
			const body = await readBody(res);

			if (contentType === 'application/json') {
				try {
					({ query, variables, operationName } = JSON.parse(body));
				} catch (e) {
					console.error('JSON.parse', e);
					res.writeStatus('400');
					return res.end(JSON.stringify({ name: e.name, message: e.message }));
				}
			}
			if (contentType === 'application/graphql') {
				query = body;
			}
			if (contentType === 'application/x-www-form-urlencoded') {
				({ query, variables, operationName } = querystring.parse(body));
			}
		}

		const response = await graphql(schema, query, root, context, variables, operationName, fieldResolver, typeResolver);

		res.end(JSON.stringify(response));
	});

	if (cors) {
		app.options('/graphql', res => {
			res.writeHeader('Access-Control-Allow-Headers', 'content-type');
			res.writeHeader('Access-Control-Allow-Methods', 'POST');
			res.writeHeader('Access-Control-Allow-Origin', '*');
			res.end();
		});
	}
}
