import { useState, startTransition, useOptimistic, use } from 'react'
import { fetchUsers, type User } from '../../../shared/api'
import { createUserAction, deleteUserAction } from '../action'

const userResponse = fetchUsers()

export const useUsers = () => {
  const [usersPromise, setUsersPromise] = useState(userResponse)

  const handleRefetch = () => {
    startTransition(() => setUsersPromise(fetchUsers()))
  }

  const [createdUsers, optimisticCreate] = useOptimistic([] as User[], (prev, user: User) => [
    ...prev,
    user,
  ])
  const [deletedUsersIds, optimisticDelete] = useOptimistic(
    [] as string[],
    (prev, userId: string) => [...prev, userId],
  )

  const useUsersList = () => {
    const users = use(usersPromise)
    return users.concat(createdUsers).filter(user => !deletedUsersIds.includes(user.id))
  }

  return {
    useUsersList,
    createUserAction: createUserAction({ refetchUsers: handleRefetch, optimisticCreate }),
    deleteUserAction: deleteUserAction({ refetchUsers: handleRefetch, optimisticDelete }),
  }
}
