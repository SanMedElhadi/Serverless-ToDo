import { TodosAccess } from './todosAcess'
import { AttachmentUtils } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
//import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
//import * as createError from 'http-errors'

// TODO: Implement businessLogic

//const logger = createLogger('TodosAccess')
const todosAccess = new TodosAccess();
const attachmentUtils = new AttachmentUtils();

export function createTodo(
  newTodo: CreateTodoRequest,
  userId: string
): Promise<TodoItem> {
  const todoId = uuid.v4()
  const createdAt = new Date().toISOString()
  const newItem = {
    userId : userId,
    todoId : todoId,
    createdAt : createdAt,
    done: false,
    attachementUrl: ''.concat('https://', process.env.ATTACHMENT_S3_BUCKET, '.s3.amazonaws.com/', todoId),
    ...newTodo
  }
  return todosAccess.createTodoItem(newItem);
}

export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
  return todosAccess.getTodoItems(userId);
}

export async function deleteTodo(
  todoId: string,
  userId: string
): Promise<void> {
  return todosAccess.deleteTodoItem(todoId, userId);
}

export async function updateTodo(
  todoId: string,
  updatedTodo: UpdateTodoRequest,
  userId: string
): Promise<void> {
  return todosAccess.updateTodoItem(todoId, updatedTodo, userId);
}


export async function getTodo(
  todoId: string,
  userId: string
): Promise<TodoItem> {
  return todosAccess.getTodoItem(todoId, userId);
}

export async function createAttachmentPresignedUrl(
  todoId: string
): Promise<string> {
  return attachmentUtils.getUploadUrl(todoId);
}