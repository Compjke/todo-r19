/* eslint-disable @typescript-eslint/no-unused-vars */
import { createUser, deleteUser, type User } from '../../shared/api'
import { v4 as uuidv4 } from 'uuid'
type CreateActionState = {
  error?: string
  name?: string
  email?: string
  city?: string
}
type DeleteActionState = {
  error?: string
}
type ClearActionState = {
  error?: string
}

export type CreateUserAction = (
  state: ClearActionState,
  formData: FormData,
) => Promise<CreateActionState>

export const createUserAction =
  ({
    refetchUsers,
    optimisticCreate,
  }: {
    refetchUsers: () => void
    optimisticCreate: (user: User) => void
  }): CreateUserAction =>
  async (_prevState, formData) => {
    const email = formData.get('email') as string
    const name = formData.get('name') as string
    let city = formData.get('city') as string

    if (!name || !email) {
      return {
        error: 'Name and email are required',
        name,
        city,
        email,
      }
    }
    try {
      if (!city) {
        city = 'Not Provided'
      }
      const newUser = {
        id: uuidv4(),
        name,
        email,
        createdAt: new Date().toISOString(),
        city,
      }
      optimisticCreate(newUser)
      await createUser(newUser)

      refetchUsers()

      return {
        error: undefined,
        name: '',
        email: '',
        city: '',
      }
    } catch (error) {
      return {
        error: `Failed to add user ${error}`,
      }
    }
  }

export type DeleteUserAction = (
  state: DeleteActionState,
  formData: FormData,
) => Promise<DeleteActionState>

export const deleteUserAction =
  ({
    refetchUsers,
    optimisticDelete,
  }: {
    refetchUsers: () => void
    optimisticDelete: (userId: string) => void
  }): DeleteUserAction =>
  async (_prevState, formData) => {
    const userId = formData.get('userId') as string
    try {
      optimisticDelete(userId)
      await deleteUser(userId)
      refetchUsers()
      return {
        error: undefined,
      }
    } catch (error) {
      return {
        error: `Failed to delete user ${error}`,
      }
    }
  }
