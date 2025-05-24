import { startTransition, Suspense, use, useActionState, useState } from 'react'
import { fetchTasks, type Task } from '../../shared/api'
import { ErrorBoundary } from 'react-error-boundary'
import clsx from 'clsx'
import { useLocation, useNavigate, useParams } from 'react-router'
import { createTaskAction, deleteTaskAction } from './actions'

export const TaskPage = () => {
  const { userId = '' } = useParams()
  const fromUserCard = useLocation().state?.fromUserCard

  const [tasksPromise, setTasksPromise] = useState(() => fetchTasks({ userId }))
  const refetchTasks = () => {
    startTransition(() => {
      setTasksPromise(fetchTasks({ userId }))
    })
  }
  const navigate = useNavigate()
  return (
    <section className="my-container">
      <h2 className="font-bold text-2xl text-center my-4">
        Task List for user {userId}
      </h2>
      <button
        className="border p-1 rounded bg-slate-200 text-gray-600 hover:bg-blue-600 hover:cursor-pointer"
        onClick={() => navigate('/')}
      >
        Go to Users
      </button>
      {fromUserCard && (
        <CreateTaskForm userId={userId} refetchTasks={refetchTasks} />
      )}
      <ErrorBoundary
        FallbackComponent={({ error }) => (
          <p className="text-center text-red-500">
            Something went wrong while fetching tasks {JSON.stringify(error)}
          </p>
        )}
        onReset={() => {
          setTasksPromise(fetchTasks({ userId }))
        }}
        onError={error => {
          console.error('Error fetching tasks:', error)
        }}
      >
        <Suspense
          fallback={<p className="text-center text-gray-500">Loading...</p>}
        >
          <TasksList tasksPromise={tasksPromise} refetchTasks={refetchTasks} />
        </Suspense>
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
      <ul className="flex flex-col gap-2 mx-auto mt-4  md:w-[50%] max-h-[400px] overflow-auto">
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

  const [state, handleDeleteTask, isFetching] = useActionState(
    deleteTaskAction({ refetchTasks }),
    {},
  )
  return (
    <li className="border-b p-2 bg-slate-100 rounded">
      <div className="flex justify-between items-center">
        {fromUserCard && (
          <input
            type="checkbox"
            className="w-4 h-4"
            name="done"
            defaultChecked={task.done}
          />
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

              <button className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 hover:cursor-pointer disabled:opacity-50">
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
