import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import executeQuery from "../tools/sqlWorker";
import * as sql from "mssql";
import errors from "../tools/errors";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    const name: string = req.query.name || (req.body && req.body.name);
    const rssLink: string = req.query.rssLink || (req.body && req.body.rssLink);

    if (name != undefined && rssLink != undefined) {
        const sqlQueryResponse: sql.IResult<any> | Error =
            await executeQuery(`INSERT INTO categories (name, rssLink) VALUES ('${name}', '${rssLink}') SELECT @@IDENTITY as categoryId`);

        if (sqlQueryResponse instanceof Error) {
            context.res = {
                body: { error: sqlQueryResponse.stack },
                status: 500
            };
        }
        else {
            if (sqlQueryResponse.recordset.length > 0) {
                context.res.body = sqlQueryResponse;
            }
            else {
                context.res = {
                    body: { error: errors.categoryNotCreated },
                    status: 404
                };
            }
        }
    }
    else {
        context.res = {
            body: { error: errors.nameAndRssLinkNotProvided },
            status: 412
        };
    }
};

export default httpTrigger;
