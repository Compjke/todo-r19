/* eslint-disable @typescript-eslint/no-unused-vars */
import { createTask, deleteTask, type Task } from '../../shared/api'
import { v4 as uuidv4 } from 'uuid'
type CreateActionState = {
  error?: string
  title: string
}
type DeleteActionState = {
  error?: string
}

export type CreateTaskAction = (
  state: CreateActionState,
  formData: FormData,
) => Promise<CreateActionState>

export const createTaskAction =
  ({
    refetchTasks,
    userId,
  }: {
    refetchTasks: () => void
    userId: string
  }): CreateTaskAction =>
  async (_prevState, formData) => {
    const title = formData.get('title') as string
    const createdAt = new Date().toISOString()
    try {
      await createTask({
        id: uuidv4(),
        title,
        done: false,
        userId,
        createdAt,
      })
      refetchTasks()
      return {
        error: undefined,
        title,
      }
    } catch (err) {
      return {
        error: `Failed to create task ${err}`,
        title,
      }
    }
  }

export type DeleteTaskAction = (
  state: DeleteActionState,
  formData: FormData,
) => Promise<DeleteActionState>

export const deleteTaskAction =
  ({ refetchTasks }: { refetchTasks: () => void }): DeleteTaskAction =>
  async (_prevState, formData) => {
    const taskId = formData.get('taskId') as string
    try {
      await deleteTask(taskId)
      refetchTasks()
      return {
        error: undefined,
      }
    } catch (error) {
      return {
        error: `Failed to delete task ${error}`,
      }
    }
  }
