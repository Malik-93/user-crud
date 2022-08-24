import logger from './logger';
import { dynamoDB } from "./db";
import crypto from 'crypto';
const backoffInterval = 5000 // 5 seconds
export const waitForTable = (TableName: string) => {
    return new Promise(resolve => {
        dynamoDB
            .describeTable({ TableName })
            .promise()
            .then((data: Object | any) => {
                if (data.Table.TableStatus !== "ACTIVE") {
                    console.log(
                        `Table status: ${data.Table.TableStatus}, retrying in ${backoffInterval}ms...`
                    )
                    setTimeout(() => waitForTable(TableName).then(resolve), backoffInterval)
                } else {
                    console.log(
                        `Table status: ${data.Table.TableStatus}`
                    )
                    return;
                }
            })
            .catch(error => {
                console.warn(
                    `Table not found! Error below. Retrying in ${backoffInterval} ms...`,
                    error
                )
                setTimeout(() => waitForTable(TableName).then(resolve), backoffInterval)
            })
    })
}

// waitForTable("my-table").then(() => console.log(`my-table is ready!`))

export const createTable = (TableName: string): void => {
    var params = {
        TableName,
        "AttributeDefinitions": [
            { "AttributeName": "id", "AttributeType": "S" },
            // { "AttributeName": "created_at", "AttributeType": "N" },

        ],
        "KeySchema": [
            { "AttributeName": "id", "KeyType": "HASH" },  //Partition key
            // { "AttributeName": "created_at", "KeyType": "RANGE" } // Secondary key
        ],
        // "LocalSecondaryIndexes": [
        //     {
        //         "IndexName": "UserIndex",
        //         "KeySchema": [
        //             {
        //                 "AttributeName": "id",
        //                 "KeyType": "HASH"
        //             },
        //             {
        //                 "AttributeName": "created_at",
        //                 "KeyType": "RANGE"
        //             }
        //         ],
        //         "Projection": {
        //             "ProjectionType": "KEYS_ONLY"
        //         }
        //     }
        // ],
        "ProvisionedThroughput": {
            "ReadCapacityUnits": 5,
            "WriteCapacityUnits": 5
        }
    };
    dynamoDB
        .createTable(params)
        .promise()
        .then((data) => {
            console.log(`Created table. Table description JSON: ${JSON.stringify(data, null, 2)}`);
            logger.info(`Created table. Table description JSON: ${JSON.stringify(data, null, 2)}`);
            waitForTable(TableName)
        })
        .catch(err => {
            if (err) {
                console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
                logger.error(`Unable to create table. Error JSON: ${JSON.stringify(err, null, 2)}`);
            }
        })
}

export const initTable = (TableName: string): void => {
    dynamoDB
        .listTables()
        .promise()
        .then(({ TableNames }) => {
            console.log("TableNames...", TableNames);
            if (!TableNames?.length || TableNames.indexOf(TableName) < 0) createTable(TableName);
            else {
                console.log(`${TableName} Table is already exist`);
                waitForTable(TableName);
            }
        })
        .catch(err => console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2)))
}

export const deleteTable = (TableName: string) => {
    dynamoDB
        .deleteTable({
            TableName,
        })
        .promise()
        .then(() => console.log(`${TableName} Table has been deleted`))
        .catch(err => console.error("Unable to delete table. Error JSON:", JSON.stringify(err, null, 2)))
}

export const generateSalt = () => `${crypto.randomBytes(20).toString('hex')}`;
export const generateHash = (value: string) => `${crypto.pbkdf2Sync(value, generateSalt(), 1000, 64, `sha512`).toString(`hex`)}`
export const sortArray = (arr: Array<Object>, sortKey: string, isAscending: boolean = true) => {
    console.log('arguments', arr, sortKey, isAscending);

    const tempArr = [...arr];
    let sortArray: Array<any> = [];
    if (sortKey.toLowerCase() === 'name' || sortKey.toLowerCase() === 'email') {
        if (isAscending) {
            sortArray = tempArr.sort((a: any, b: any) => a[sortKey].localeCompare(b[sortKey]));
        }
        else {
            sortArray = tempArr.sort((a: any, b: any) => b[sortKey].localeCompare(a[sortKey]));
        }
    }
    else if (sortKey.toLowerCase() === 'created_at') {
        if (isAscending) {
            sortArray = tempArr.sort((a: any, b: any) => +new Date(a[sortKey]) - +new Date(b[sortKey]));
        }
        else {
            sortArray = tempArr.sort((a: any, b: any) => +new Date(b[sortKey]) - +new Date(a[sortKey]));
        }
    }
    else {
        if (isAscending) {
            sortArray = tempArr.sort((a: any, b: any) => a[sortKey] - b[sortKey]);
        } else {
            sortArray = tempArr.sort((a: any, b: any) => b[sortKey] - a[sortKey]);
        }
    }
    return sortArray;
}
export const convertDateToTimestamp = (dateTime: string) => {
    var datum: number = Date.parse(dateTime);
    return Math.floor(datum / 1000);
}
export const convertTimestampToDateStr = (dateTimeStr: number) => {
    return `${new Date(dateTimeStr * 1000).toISOString().split("T")[0]}`
}

export const dateRangeValidation = (itemDate: string, startDate: string, endDate: string) => {
    console.log(startDate);
    console.log(itemDate);
    console.log(endDate);
    const date = new Date(`${itemDate}`);
    const start = new Date(`${startDate}`);
    const end = new Date(`${endDate}`);
    if (date >= start && date <= end) {
        console.log('✅ date is between the 2 dates');
        return true;
    } else {
        console.log('⛔️ date is not in the range');
        return false;
    }

}