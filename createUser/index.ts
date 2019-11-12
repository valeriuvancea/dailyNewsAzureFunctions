import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import executeQuery from "../tools/sqlWorker";
import * as sql from "mssql";
import errors from "../tools/errors";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    const username: string = req.query.username || (req.body && req.body.username);
    const password: string = req.query.password || (req.body && req.body.password);

    if (username != undefined && password != undefined) {
        const sqlQueryResponse: sql.IResult<any> | Error =
            await executeQuery(`INSERT INTO users (username, password) VALUES ('${username}', '${password}') SELECT @@IDENTITY as userId`);

        if (sqlQueryResponse instanceof Error) {
            context.res = {
                body: { error: sqlQueryResponse.stack },
                status: 500
            };
        }
        else {
            if (sqlQueryResponse.recordset.length > 0) {
                context.res.body = sqlQueryResponse.recordset;
            }
            else {
                context.res = {
                    body: { error: errors.userNotCreated },
                    status: 404
                };
            }
        }
    }
    else {
        context.res = {
            body: { error: errors.usernameAndPasswordNotProvided },
            status: 412
        };
    }
};

export default httpTrigger;
