import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import executeQuery from "../tools/sqlWorker";
import * as sql from "mssql";
import isNaturalNumber from "../tools/naturalNumberVerification"

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    const userId: string = req.params.userId;
    if (isNaturalNumber(userId)) {
        const sqlQueryResponse: sql.IResult<any> | Error =
            await executeQuery(`SELECT c.name, c.categoryId, uc.userId  FROM categories c LEFT JOIN
                    usersWithCategories uc ON c.categoryId = uc.categoryId and uc.userId = ${userId}`);

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
                    body: { error: "There are no categories!" },
                    status: 404
                };
            }
        }
    }
    else {
        context.res = {
            body: { error: "userId field provided is not a natural number bigger then 0!" },
            status: 412
        };
    }
};

export default httpTrigger;
