import * as dotenv from 'dotenv';
// eslint-disable-next-line @typescript-eslint/no-var-requires
import AWS from 'aws-sdk';
import { ServiceConfigurationOptions } from 'aws-sdk/lib/service';
dotenv.config();
const serviceConfigOptions: ServiceConfigurationOptions = {
    region: `${process.env.REGION}`,
    endpoint: `${process.env.DB_ENDPOINT}`,
}
const dynamoDB = new AWS.DynamoDB(serviceConfigOptions);
const dynamoDBClient = new AWS.DynamoDB.DocumentClient(serviceConfigOptions)

export {
    dynamoDB,
    dynamoDBClient
}