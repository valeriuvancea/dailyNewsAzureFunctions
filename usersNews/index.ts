import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import executeQuery from "../tools/sqlWorker";
import * as sql from "mssql";
import isNaturalNumber from "../tools/naturalNumberVerification"
const Parser = require('rss-parser');
const parser = new Parser();

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    const userId: string = context.req.params.userId;
    if (isNaturalNumber(userId)) {
        const sqlQueryResponse: sql.IResult<any> | Error =
            await executeQuery(`SELECT c.name, c.rssLink, uc.userId  FROM categories c LEFT JOIN
                        usersWithCategories uc ON c.categoryId = uc.categoryId and uc.userId = ${userId}`);

        if (sqlQueryResponse instanceof Error) {
            context.res = {
                body: { error: sqlQueryResponse.stack },
                status: 500
            };
        }
        else {
            if (sqlQueryResponse.recordset.length > 0) {
                let news = new Array();
                let error: any;
                for (let i: number = 0; i < sqlQueryResponse.recordset.length; i++) {
                    let record = sqlQueryResponse.recordset[i];
                    let parserResult: any;

                    if (record.userId == null) {
                        continue;
                    }

                    await new Promise(async (resolve, reject) => {
                        try {
                            const feed = await parser.parseURL(record.rssLink);
                            resolve(feed);
                        }
                        catch (error) {
                            reject(error);
                        }
                    }).then(feed => parserResult = feed).catch(err => error = err);

                    if (error !== undefined) {
                        context.res = {
                            body: { error: "Rss parser error: " + error },
                            status: 500
                        };
                    }

                    const dateOptions: any = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                    parserResult.items.forEach((item: any) => {
                        news.push({
                            category: record.name,
                            title: item.title,
                            pubDate: new Date(item.pubDate).toLocaleString('en-GB', dateOptions),
                            link: item.link
                        });
                    })
                }

                news = news.sort((a, b) => Date.parse(b.pubDate) - Date.parse(a.pubDate));

                context.res.body = news;
            }
            else {
                context.res = {
                    body: { error: "There is no user with the given ID or the user doesn't have any categories assigned" },
                    status: 500
                };
            }
        }
    }
    else {
        context.res = {
            body: { error: "userId field provided is not a natural number bigger then 0!" },
            status: 500
        };
    }
};

export default httpTrigger;
