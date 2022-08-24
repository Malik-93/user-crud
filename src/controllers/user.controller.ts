import { IUser, IUserFilter, IUserResponse } from './../interfaces/User';
import { Get, Route, Post, Body, Tags } from "tsoa";
import * as dotenv from 'dotenv';
import { dynamoDBClient } from '../utils/db';
import { USERS_TABLE_NAME } from '../constants';
import { generateSalt, generateHash, sortArray, convertDateToTimestamp, convertTimestampToDateStr, dateRangeValidation } from '../utils/utils';
dotenv.config();
@Route('/api/v1/user')
@Tags("Users")
export default class UserController {
  //  GET A SINGLE RECORD IF EXIST
  private async getRecord(id: string): Promise<any> {
    try {
      const params = {
        TableName: USERS_TABLE_NAME,
        Key: {
          id
        }
      }
      const res = await dynamoDBClient.get(params).promise();
      if (res.Item) return res.Item;
      else return false;
    } catch (error) {
      return false
    }

  }
  // CREATE OR UPDATE A USER
  @Post('/create-update')
  public async create_update(@Body() body: IUser): Promise<IUserResponse> {
    let item: IUser = body;
    try {
      const id = body.id;
      if (id) {
        const isItemExist = await this.getRecord(id);
        if (!isItemExist) return {
          message: `${id} record not found`,
          statusCode: 404,
          success: true,
        };
        const response = await dynamoDBClient
          .update({
            TableName: USERS_TABLE_NAME,
            Key: {
              id: item.id,
            },
            UpdateExpression: `set #nm = :name, #em = :email, #ph = :phone, #pw = :password, #ua = :updated_at`,
            ExpressionAttributeValues: {
              ":name": `${item.name}`.trim().toLowerCase(),
              ":email": `${item.email}`.trim().toLowerCase(),
              ":phone": `${item.phone}`,
              ":password": `${generateHash(item.password)}`,
              ":updated_at": Math.floor(Date.now() / 1000),
            },
            ExpressionAttributeNames: {
              "#nm": "name",
              "#em": "email",
              "#ph": "phone",
              "#pw": "password",
              "#ua": "updated_at",
            },
          })
          .promise();
        return {
          statusCode: 200,
          success: true,
          message: `${item.id} user updated successfylly`,
        };
      } else {
        const userId = generateSalt()
        // item = { ...item, id: userId, name: `${item.name}`.trim().toLowerCase(), email: `${item.email}`.trim().toLowerCase(), password: `${generateHash(item.password)}`, created_at: Math.floor(new Date('2022-08-20').getTime() / 1000) }
        item = { ...item, id: userId, name: `${item.name}`.trim().toLowerCase(), email: `${item.email}`.trim().toLowerCase(), password: `${generateHash(item.password)}`, created_at: Math.floor(Date.now() / 1000) }
        console.log(` item ${item} `)
        const response = await dynamoDBClient
          .put({
            Item: item,
            TableName: USERS_TABLE_NAME,
          })
          .promise()
        console.log(`[create_update].response`, response)
        return {
          success: true,
          statusCode: 200,
          message: `user created successfylly`,
          docs: userId

        };
      }
    } catch (error) {
      return {
        error: `An error accured during user creation ${JSON.stringify(error, null, 2)} `,
        statusCode: 500,
      };
    }
  };

  // FILTER USERS
  @Post("/filter")
  public async filterUser(@Body() body: IUserFilter): Promise<IUserResponse> {
    const { qurey, sortByEnumValue, isAscending, startDate, endDate } = body;
    const queryStr = `${qurey}`.trim().toLowerCase();
    const scanParams = {
      FilterExpression: "contains(#email, :email) OR contains(#phone, :phone) OR contains(#name, :name)",
      ExpressionAttributeNames: {
        "#email": "email",
        "#phone": "phone",
        "#name": "name"
      },
      ExpressionAttributeValues: {
        ':email': queryStr,
        ':phone': queryStr,
        ':name': queryStr
      },
      // ScanIndexForward: true,
      // KeyConditionExpression: 'id = :HASH and created_at > :created_at',
      TableName: USERS_TABLE_NAME
    }

    const result = await dynamoDBClient.scan(scanParams).promise();
    if (result.Items?.length) {
      let _items: Array<any> = [];
      // Range Filter Logic Start
      if (startDate !== undefined && endDate !== undefined) {
        for (let index = 0; index < result.Items.length; index++) {
          const el = result.Items[index];
          if (dateRangeValidation(convertTimestampToDateStr(el.created_at), `${startDate}`, `${endDate}`)) _items.push(el);
        }
      } else _items = result.Items;
      // Range Filter Logic End

      // Checking _items lenght if query matched but the date range requested by user is not in between
      if (_items.length) {
        const sortedResults = sortArray(
          _items.map((_item) => ({ ..._item, created_at: convertTimestampToDateStr(_item.created_at), updated_at: _item.updated_at ? convertTimestampToDateStr(_item.updated_at) : '' })),
          sortByEnumValue,
          isAscending);
        return {
          message: `user filtered successfully`,
          statusCode: 200,
          success: true,
          docs: sortedResults,
        }
      } else return {
        message: `No record found for the date Range as start -> ${startDate}, end -> ${endDate}`,
        statusCode: 404,
        success: true,
        docs: [],
      }
    } else return {
      message: `No record found for the query -> ${queryStr}`,
      statusCode: 404,
      success: true,
      docs: [],
    }
  };

  // DELETE USER
  @Post("/delete")
  public async deleteUser(@Body() body: { id: string }): Promise<IUserResponse> {
    try {
      const id = body.id;
      const isItemExist = await this.getRecord(id);
      if (!isItemExist) return {
        message: `having id ${id} record not found`,
        statusCode: 404,
        success: true,
      };
      await dynamoDBClient
        .delete({
          TableName: USERS_TABLE_NAME,
          Key: {
            id
          },
        })
        .promise()
      return {
        message: `user deleted having id ${id}`,
        statusCode: 200,
        success: true,
      };
    } catch (error) {
      return {
        error: `An error accured while deleting the user ${JSON.stringify(error, null, 2)} `,
        statusCode: 500,
      };
    }
  };

  // GET ALL USERS
  @Get("/list")
  public async getAllUser(): Promise<IUserResponse> {
    try {
      const data = await dynamoDBClient
        .scan({
          TableName: USERS_TABLE_NAME,
        })
        .promise()
      return {
        message: `Success`,
        statusCode: 200,
        success: true,
        data: data.Items?.map((_item) => ({ ..._item, createTimestamp: _item.created_at, updateTimestamp: _item.updated_at, created_at: convertTimestampToDateStr(_item.created_at), updated_at: _item.updated_at ? convertTimestampToDateStr(_item.updated_at) : '' }))
      };
    } catch (error) {
      return {
        error: `An error accured during user creation ${JSON.stringify(error, null, 2)} `,
        statusCode: 500,
      };
    }

  }
}
