import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import executeQuery from "../tools/sqlWorker";
import * as sql from "mssql";
import isNaturalNumber from "../tools/naturalNumberVerification";
import errors from "../tools/errors";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    const categoryId: string = context.req.params.categoryId;

    if (isNaturalNumber(categoryId)) {
        const sqlQueryResponse: sql.IResult<any> | Error =
            await executeQuery(`DELETE FROM categories WHERE categoryId='${categoryId}'`);

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
                    body: { error: errors.categoryNotDeleted },
                    status: 404
                };
            }
        }
    }
    else {
        context.res = {
            body: { error: errors.categoryIdIsNotANaturalNumber },
            status: 412
        };
    }
};

export default httpTrigger;
