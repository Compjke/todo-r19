import { Suspense, useActionState } from 'react'
import { type User } from '../../shared/api'

import clsx from 'clsx'
import { ErrorBoundary } from 'react-error-boundary'
import { type CreateUserAction, type DeleteUserAction } from './action'
import { useUsers } from './hooks/use-users'
import { Link } from 'react-router'

export const UserPage = () => {
  const { useUsersList, createUserAction, deleteUserAction } = useUsers()

  return (
    <section className="my-container">
      <h2 className="font-bold text-2xl text-center my-4">User List</h2>
      <CreateUserForm createUserAction={createUserAction} />
      <ErrorBoundary
        fallbackRender={({ error }) => (
          <p className="text-center text-red-500">
            Something went wrong {JSON.stringify(error)}
          </p>
        )}
      >
        <Suspense
          fallback={<p className="text-center text-gray-500">Loading...</p>}
        >
          <UsersList
            useUsersList={useUsersList}
            deleteUserAction={deleteUserAction}
          />
        </Suspense>
      </ErrorBoundary>
    </section>
  )
}

export const CreateUserForm = ({
  createUserAction,
}: {
  createUserAction: CreateUserAction
}) => {
  const [state, dispatch, isPending] = useActionState(createUserAction, {
    name: '',
    email: '',
    error: undefined,
  })

  return (
    <>
      <form
        action={dispatch}
        className="flex flex-col gap-4 justify-center md:flex-row"
      >
        <input
          type="text"
          disabled={isPending}
          className="border p-2 rounded"
          name="name"
          placeholder="Name"
          defaultValue={state.name}
        />
        <input
          disabled={isPending}
          type="email"
          className="border p-2 rounded"
          name="email"
          placeholder="Email"
          defaultValue={state.email}
        />
        <input
          disabled={isPending}
          type="text"
          className="border p-2 rounded"
          name="city"
          placeholder="City"
          defaultValue={state.city}
        />
        <button
          disabled={isPending}
          className="border disabled:opacity-50 p-2 rounded bg-blue-500 text-white hover:bg-blue-600 hover:cursor-pointer"
        >
          {isPending ? 'Adding...' : 'Add User'}
        </button>
      </form>
      {state.error && (
        <p className={clsx('text-center mt-2 text-red-500')}>{state.error}</p>
      )}
    </>
  )
}

export const UsersList = ({
  useUsersList,
  deleteUserAction,
}: {
  useUsersList: () => User[]
  deleteUserAction: DeleteUserAction
}) => {
  const users = useUsersList()

  return (
    <>
      <ul className="p-3 border rounded flex flex-col gap-2 mx-auto mt-4  md:w-[50%] max-h-[400px] overflow-auto">
        {users.length === 0 && (
          <li className="border-b p-2 bg-slate-100 rounded text-center">
            List is empty
          </li>
        )}
        {users.map(user => (
          <UserItem
            key={user.id}
            user={user}
            deleteUserAction={deleteUserAction}
          />
        ))}
      </ul>
    </>
  )
}

export const UserItem = ({
  user,

  deleteUserAction,
}: {
  user: User

  deleteUserAction: DeleteUserAction
}) => {
  const [state, handleDelete, isPending] = useActionState(deleteUserAction, {
    error: undefined,
  })

  return (
    <li key={user.id} className="border-b p-2 bg-slate-100 rounded">
      <div className="flex justify-between items-center">
        <img
          className="w-10 h-10 rounded-full"
          src={user.avatar || 'https://via.placeholder.com/150'}
          alt={user.name}
        />
        <p className="flex-1 flex flex-col items-center justify-center text-center">
          <span className="font-bold text-xl">{user.name}</span>
          <span className="italic text-sm">{user.email}</span>
          <span className="italic text-sm">{user.city}</span>
          <Link
            className="text-blue-500 hover:underline"
            to={`/${user.id}/tasks`}
            state={{ fromUserCard: true }}
          >
            View Tasks
          </Link>
        </p>
        <form action={handleDelete} className="flex gap-2 flex-col">
          <input type="hidden" name="userId" value={user.id} />
          <button
            disabled={isPending}
            className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 hover:cursor-pointer disabled:opacity-50"
          >
            X
          </button>
          {state.error && <p className="text-red-500">{state.error}</p>}
        </form>
      </div>
    </li>
  )
}
