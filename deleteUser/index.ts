import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import executeQuery from "../tools/sqlWorker";
import * as sql from "mssql";
import isNaturalNumber from "../tools/naturalNumberVerification";
import errors from "../tools/errors";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    const userId: string = context.req.params.userId;

    if (isNaturalNumber(userId)) {
        const sqlQueryResponse: sql.IResult<any> | Error =
            await executeQuery(`DELETE FROM users WHERE userId='${userId}'`);

        if (sqlQueryResponse instanceof Error) {
            context.res = {
                body: { error: sqlQueryResponse.stack },
                status: 500
            };
        }
        else {
            if (sqlQueryResponse.rowsAffected.length > 0) {
                context.res.body = sqlQueryResponse;
            }
            else {
                context.res = {
                    body: { error: errors.userNotDeleted },
                    status: 404
                };
            }
        }
    }
    else {
        context.res = {
            body: { error: errors.userIdIsNotANaturalNumber },
            status: 412
        };
    }
};

export default httpTrigger;
