import { createContext, startTransition, use, useState } from 'react'
import { fetchUsers, type User } from '../shared/api'

type UserContextValue = {
  usersPromise: Promise<User[]>
  refetchUsers: (page?: number) => void
}
const UserContext = createContext<UserContextValue | null>(null)

const userResponse = fetchUsers()

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [usersPromise, setUsersPromise] = useState(userResponse)

  const handleRefetch = () => {
    startTransition(() => setUsersPromise(fetchUsers()))
  }
  return (
    <UserContext value={{ usersPromise, refetchUsers: handleRefetch }}>
      {children}
    </UserContext>
  )
}

export const useUserContext = () => {
  const users = use(UserContext)
  if (!users) {
    throw new Error('useUserContext must be used within a UserProvider')
  }
  return users
}
