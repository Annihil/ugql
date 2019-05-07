import gql from 'graphql';

const { graphql } = gql;

const readJson = res => {
	return new Promise((resolve, reject) => {
		let buffer;
		res.onData((ab, isLast) => {
			const chunk = Buffer.from(ab);
			buffer = buffer ? Buffer.concat([buffer, chunk]) : chunk;
			if (!isLast) return;

			let json;
			try {
				json = JSON.parse(buffer);
			} catch (e) {
				return reject(e);
			}
			resolve(json);
		});
	});
};

export default (app, cors = false) => (schema, root, context, operationName, fieldResolver, typeResolver) => {
	app.post('/graphql', async (res, req) => {
		res.onAborted(err => {
			throw err;
		});

		if (cors) res.writeHeader('Access-Control-Allow-Origin', '*');
		res.writeHeader('content-type', 'application/json');

		let json;
		try {
			json = await readJson(res);
		} catch (e) {
			console.error('readJson', e);
			res.writeStatus('400');
			return res.end(JSON.stringify({ name: e.name, message: e.message }));
		}

		let response;
		try {
			response =
				await graphql(schema, json.query, root, context, json.variable, operationName, fieldResolver, typeResolver);
		} catch (e) {
			console.error('GraphQL error', e);
			res.writeStatus('400');
			return res.end(JSON.stringify({ name: e.name, message: e.message }));
		}

		res.end(JSON.stringify(response));
	});

	if (cors) {
		app.options('/graphql', (res, req) => {
			console.log('OPTIONS', req.getUrl());
			res.writeHeader('Access-Control-Allow-Headers', 'content-type');
			res.writeHeader('Access-Control-Allow-Methods', 'POST');
			res.writeHeader('Access-Control-Allow-Origin', '*');
			res.end();
		});
	}
}
