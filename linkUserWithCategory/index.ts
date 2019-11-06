import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import executeQuery from "../tools/sqlWorker";
import * as sql from "mssql";
import isNaturalNumber from "../tools/naturalNumberVerification"
import errors from "../tools/errors";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    const userId: string = req.params.userId;
    const categoryId: string = req.params.categoryId;

    if (isNaturalNumber(userId) && isNaturalNumber(categoryId)) {
        const sqlQueryResponse: sql.IResult<any> | Error =
            await executeQuery(`INSERT INTO usersWithCategories VALUES (${userId}, ${categoryId})`);

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
                    body: { error: errors.userNotUpdated },
                    status: 404
                };
            }
        }
    }
    else {
        context.res = {
            body: { error: errors.userIdAndCategoryIdAreNotNaturalNumbers },
            status: 412
        };
    }
};

export default httpTrigger;
