import { useOptimistic, use } from 'react'
import { type User } from '../../../shared/api'
import { createUserAction, deleteUserAction } from '../action'
import { useUserContext } from '../../../entities/user'


export const useUsers = () => {
  const { usersPromise, refetchUsers } = useUserContext()

  const [createdUsers, optimisticCreate] = useOptimistic(
    [] as User[],
    (prev, user: User) => [...prev, user],
  )
  const [deletedUsersIds, optimisticDelete] = useOptimistic(
    [] as string[],
    (prev, userId: string) => [...prev, userId],
  )

  const useUsersList = () => {
    const users = use(usersPromise)
    return users
      .concat(createdUsers)
      .filter(user => !deletedUsersIds.includes(user.id))
  }

  return {
    useUsersList,
    createUserAction: createUserAction({
      refetchUsers,
      optimisticCreate,
    }),
    deleteUserAction: deleteUserAction({
      refetchUsers,
      optimisticDelete,
    }),
  }
}
