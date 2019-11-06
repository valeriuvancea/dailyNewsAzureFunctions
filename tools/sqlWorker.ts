import * as sql from "mssql";

async function executeQuery(query: string) {
	const dbSetting: sql.config = {
		user: process.env.databaseUser,
		password: process.env.databaseUserPassword,
		server: process.env.databaeHost || "localhost",
		database: process.env.databaseName || "database",
		options: {
			encrypt: true
		}
	}

	let connectionPool = new sql.ConnectionPool(dbSetting);
	await connectionPool.connect();
	const request: sql.Request = new sql.Request(connectionPool);
	return request.query(query).then((result) => result).catch((error) => error);
};

export default executeQuery;