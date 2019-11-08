import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import executeQuery from "../tools/sqlWorker";
import * as sql from "mssql";
import errors from "../tools/errors";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    const sqlQueryResponse: sql.IResult<any> | Error =
        await executeQuery(`SELECT * FROM categories`);

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
                body: { error: errors.noCategories },
                status: 404
            };
        }
    }
};

export default httpTrigger;
