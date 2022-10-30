import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { createAttachmentPresignedUrl } from '../../helpers/todos'
import { getUserId } from '../utils'
import { TodosAccess } from '../../helpers/todosAcess'

const todosAccess = new TodosAccess();

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const IMAGES_S3_BUCKET = process.env.IMAGES_S3_BUCKET;
    // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
    const userId = getUserId(event);
    const presignedUrl = await createAttachmentPresignedUrl(todoId);   
    const attachmentUrl = ''.concat('https://', IMAGES_S3_BUCKET, '.s3.amazonaws.com/${todoId}');
    await todosAccess.updateTodoAttachment(todoId, userId, attachmentUrl);

    return {
      statusCode: 201,
      body: JSON.stringify({
        uploadUrl: presignedUrl
      })
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
