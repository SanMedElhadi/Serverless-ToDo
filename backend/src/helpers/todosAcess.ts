import * as AWS from 'aws-sdk'
const AWSXRay =  require('aws-xray-sdk');
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

const docClient : DocumentClient = createDynamoDBClient();

// TODO: Implement the dataLayer logic

export class TodosAccess{

  constructor(){
    
  }

  

  async getTodoItems(userId: string): Promise<TodoItem[]> {
    logger.info('Getting all todos')
    /*
    const valideUser = userExists(userId);
    if(!valideUser)
      return Promise.reject('User does not exist');
    */
    const params = {
      TableName: process.env.TODOS_TABLE,
      Index : process.env.TODOS_CREATED_AT_INDEX,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    }

    const result = await docClient.query(params).promise();
    logger.info('Todos : ', result);
    return result.Items as TodoItem[];
  }

 async createTodoItem(todoItem: TodoItem): Promise<TodoItem> {
  logger.info('Creating a todo')
  /*
  const valideUser = userExists(todoItem.userId);
  if(!valideUser){
    return Promise.reject('User does not exist');
  }
  */
  const params = {
    TableName: process.env.TODOS_TABLE,
    Item: todoItem
  }

  await docClient.put(params).promise();
  logger.info('Todo Created', todoItem);
  return todoItem;
}

  async deleteTodoItem(todoId: string, userId: string): Promise<void> {
  logger.info('Deleting a todo')
  /*
  const valideUser = userExists(userId);
  if(!valideUser)
    return Promise.reject('User does not exist');
  */
  const params = {
    TableName: process.env.TODOS_TABLE,
    Key: {
      todoId,
      userId
    }
  }

  return docClient
    .delete(params)
    .promise()
    .then(() => {
      logger.info('Todo Deleted');
    })
}

async updateTodoItem(
  todoId: string,
  updatedTodo: TodoUpdate,
  userId: string
): Promise<void> {
  logger.info('Updating a todo')
  /*
  const valideUser = userExists(userId);
  if(!valideUser)
    return Promise.reject('User does not exist');
  */
  const params = {
    TableName: process.env.TODOS_TABLE,
    Index : process.env.TODOS_CREATED_AT_INDEX,
    Key: {
      todoId,
      userId
    },
    UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
    ExpressionAttributeValues: {
      ':name': updatedTodo.name,
      ':dueDate': updatedTodo.dueDate,
      ':done': updatedTodo.done
    },
    ExpressionAttributeNames: {
      '#name': 'name'
    },
    ReturnValues: 'UPDATED_NEW'
  }

  return docClient
    .update(params)
    .promise()
    .then(() => {
      logger.info('Todo Updated')
    })
}

 async getTodoItem(todoId: string, userId: string): Promise<TodoItem> {
  logger.info('Getting a todo')
  /*
  const valideUser = await userExists(userId);
  if(!valideUser)
    return Promise.reject('User does not exist');
  */
  const params = {
    TableName: process.env.TODOS_TABLE,
    Key: {
      todoId,
      userId
    }
  }

  return docClient
    .get(params)
    .promise()
    .then(result => result.Item as TodoItem)
}

async userExists(userId: string): Promise<boolean> {
  logger.info('Checking if a user exists')

  const params = {
    TableName: process.env.USERS_TABLE,
    Key: {
      userId
    }
  }

  return docClient
    .get(params)
    .promise()
    .then(result => !!result.Item)
}

async updateTodoAttachment(
  todoId: string,
  userId: string,
  attachmentUrl: string
) {
  logger.info('Updating a todo attachment')

  const params = {
    TableName: process.env.TODOS_TABLE,
    Key: {
      todoId,
      userId
    },
    UpdateExpression: 'set attachmentUrl = :attachmentUrl',
    ExpressionAttributeValues: {
      ':attachmentUrl': attachmentUrl
    },
    ReturnValues: 'UPDATED_NEW'
  }

  return docClient
    .update(params)
    .promise()
    .then(() => {
      logger.info('Attachement Updated')
    })
}

}

function createDynamoDBClient(): AWS.DynamoDB.DocumentClient {
  if(process.env.IS_OFLINE) {
    logger.info('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    });
  }

  return new XAWS.DynamoDB.DocumentClient();
}