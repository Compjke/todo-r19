import { Suspense, use, useActionState } from 'react'
import { fetchTasks, type Task } from '../../shared/api'
import { ErrorBoundary } from 'react-error-boundary'
import clsx from 'clsx'
import { useLocation, useNavigate, useParams } from 'react-router'
import { createTaskAction, deleteTaskAction, updateTaskAction } from './actions'
import { useUserContext } from '../../entities/user'
import { useTasks } from './hooks/use-taks'

export const TaskPage = () => {
  const navigate = useNavigate()
  const { userId = '' } = useParams()
  const fromUserCard = useLocation().state?.fromUserCard
  const {
    tasksPromise,
    totalPages,
    page,
    refetchTasks,
    goToPage,
    goToSpecificPage,
    searchTitle,
    handleChangeSearch,
    sortType,
    handleSortChange,
    setTasksPromise,
  } = useTasks({ userId })

  return (
    <section className="my-container">
      <button
        className="border p-1 rounded bg-slate-200 text-gray-600 hover:bg-blue-600 hover:cursor-pointer mt-2"
        onClick={() => navigate('/')}
      >
        Go to Users
      </button>
      <h2 className="font-bold text-2xl text-center my-4">
        Task List for:
        {fromUserCard ? (
          <Suspense>
            <UserPreview userId={userId} />
          </Suspense>
        ) : (
          ' all users'
        )}
      </h2>

      {fromUserCard && (
        <CreateTaskForm
          userId={userId}
          refetchTasks={() => refetchTasks(page)}
        />
      )}
      <div className="flex justify-center items-center my-4 flex-col gap-2">
        <input
          type="search"
          className="border p-2 rounded"
          placeholder="Search by title"
          value={searchTitle}
          onChange={handleChangeSearch}
        />
        <select
          value={sortType}
          onChange={handleSortChange}
          className="border p-2 rounded"
        >
          <option value="" disabled>
            Select sorting
          </option>
          <option value="completed">Show all completed</option>
          <option value="incompleted">Show all incompleted</option>
          <option value="all">Show all</option>
        </select>
      </div>
      <ErrorBoundary
        FallbackComponent={({ error }) => (
          <p className="text-center text-red-500">
            Something went wrong while fetching tasks {JSON.stringify(error)}
          </p>
        )}
        onReset={() => {
          setTasksPromise(
            fetchTasks({
              userId,
              page,
              limit: 10, // Default limit
              orderBy: 'createdAt',
              order: 'desc', // Fixed to match the default order
            }),
          )
        }}
        onError={error => {
          console.error('Error fetching tasks:', error)
        }}
      >
        <Suspense
          fallback={
            <div className="text-center h-[400px] text-gray-500 flex items-center justify-center">
              <span>Loading...</span>
            </div>
          }
        >
          <TasksList
            tasksPromise={tasksPromise}
            refetchTasks={() => refetchTasks(page)}
          />
        </Suspense>
        {totalPages > 1 && (
          <Pagination
            page={page}
            pages={totalPages}
            goToFirst={() => goToPage('first')}
            goToLast={() => goToPage('last')}
            setPage={goToSpecificPage}
            refetchTasks={refetchTasks}
          />
        )}
      </ErrorBoundary>
    </section>
  )
}

export const CreateTaskForm = ({
  userId,
  refetchTasks,
}: {
  userId: string
  refetchTasks: () => void
}) => {
  const [state, handleCreateTask, isFetching] = useActionState(
    createTaskAction({ userId, refetchTasks }),
    {
      title: '',
    },
  )

  return (
    <>
      <form
        action={handleCreateTask}
        className="flex flex-col gap-4 justify-center md:flex-row"
      >
        <input
          type="text"
          className="border p-2 rounded"
          name="title"
          disabled={isFetching}
          defaultValue={state.title}
          placeholder="Title"
        />

        <button
          disabled={isFetching}
          className="border disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-300 p-2 rounded bg-blue-500 text-white hover:bg-blue-600 hover:cursor-pointer"
        >
          {isFetching ? 'Creating...' : 'Create Task'}
        </button>
      </form>
      {state.error && (
        <p className={clsx('text-center mt-2 text-red-500')}>{state.error}</p>
      )}
    </>
  )
}

export const TasksList = ({
  tasksPromise,
  refetchTasks,
}: {
  tasksPromise: Promise<Task[]>
  refetchTasks: () => void
}) => {
  const tasks = use(tasksPromise)

  return (
    <>
      <ul className="flex flex-col gap-2 mx-auto mt-4  max-h-[400px] overflow-auto">
        {tasks.length === 0 && (
          <li className="border-b p-2 bg-slate-100 rounded text-center">
            List is empty
          </li>
        )}
        {tasks.map(task => (
          <TaskItem key={task.id} task={task} refetchTasks={refetchTasks} />
        ))}
      </ul>
    </>
  )
}

export const TaskItem = ({
  task,
  refetchTasks,
}: {
  task: Task
  refetchTasks: () => void
}) => {
  const fromUserCard = useLocation().state?.fromUserCard
  const [stateUpdate, handleUpdateTask, isUpdating] = useActionState(
    updateTaskAction({ refetchTasks, done: task.done, taskId: task.id }),
    { done: task.done }, // Initial state with current task done status
  )
  const [state, handleDeleteTask, isFetching] = useActionState(
    deleteTaskAction({ refetchTasks }),
    {},
  )
  return (
    <li className="border-b p-2 bg-slate-100 rounded">
      <div className="flex justify-between items-center">
        {fromUserCard && (
          <>
            <input
              disabled={isUpdating}
              type="checkbox"
              className="w-4 h-4"
              name="done"
              onChange={e => {
                handleUpdateTask({ done: e.target.checked, taskId: task.id })
              }}
              defaultChecked={task.done}
            />

            {stateUpdate.error && (
              <p className="text-red-500">{stateUpdate.error}</p>
            )}
          </>
        )}
        <p className="flex-1 flex flex-col items-center justify-center text-center">
          <span
            className={clsx('font-bold text-l', task.done && 'line-through')}
          >
            Id: {task.id}
          </span>
          <span
            className={clsx('font-bold text-xl', task.done && 'line-through')}
          >
            Title: {task.title}
          </span>
          <span className="italic text-sm">
            {new Date(task.createdAt).toLocaleString('ru-RU', {})}
          </span>
        </p>
        {fromUserCard && (
          <>
            <form action={handleDeleteTask} className="flex gap-2 flex-col">
              <input type="hidden" name="taskId" value={task.id} />

              <button
                disabled={isFetching}
                className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 hover:cursor-pointer disabled:opacity-50"
              >
                Delete
              </button>
            </form>
            {state.error && <p className="text-red-500">{state.error}</p>}
          </>
        )}
      </div>
    </li>
  )
}

const UserPreview = ({ userId }: { userId: string }) => {
  const { usersPromise } = useUserContext()

  const users = use(usersPromise)
  const user = users.find(u => u.id === userId)
  if (!user) {
    return <p className="text-center text-gray-500">User not found</p>
  }
  return (
    <div className="flex items-center border border-gray-300 max-w-[400px] mx-auto rounded p-2 my-2">
      <img
        className="w-10 h-10 rounded-full"
        src={user.avatar || 'https://via.placeholder.com/150'}
        alt={user.name}
      />
      <p className="flex-1 flex flex-col items-center justify-center text-center">
        <span className="font-bold text-xl">{user.name}</span>
      </p>
    </div>
  )
}

const Pagination = ({
  page,
  pages,
  goToFirst,

  goToLast,
  setPage,
  refetchTasks,
}: {
  page: number
  pages: number
  goToFirst: () => void

  goToLast: () => void
  setPage: (pageNumber: number) => void
  refetchTasks: (p?: number) => void
}) => {
  // Generate an array of page numbers (e.g., [1, 2, 3, ..., pages])
  const pageNumbers = Array.from({ length: pages }, (_, index) => index + 1)

  // Function to jump to a specific page
  const goToSpecificPage = (pageNumber: number) => {
    setPage(pageNumber)
    refetchTasks(pageNumber)
  }

  return (
    <nav className="flex justify-center mt-4">
      <div className="flex gap-2 items-center">
        {/* First page button */}
        <button
          onClick={goToFirst}
          disabled={page === 1}
          className="border p-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {'<<'}
        </button>

        {/* Page number buttons */}
        {pageNumbers.map(pageNumber => (
          <button
            key={pageNumber}
            onClick={() => goToSpecificPage(pageNumber)}
            className={clsx(
              'border p-1 rounded',
              page === pageNumber
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-200',
            )}
          >
            {pageNumber}
          </button>
        ))}

        {/* Last page button */}
        <button
          onClick={goToLast}
          disabled={page === pages}
          className="border p-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {'>>'}
        </button>
      </div>
      <span className="ml-4">
        Page {page} of {pages}
      </span>
    </nav>
  )
}
