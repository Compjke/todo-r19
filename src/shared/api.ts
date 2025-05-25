const API_URL = 'https://6786b3a1f80b78923aa7e6d5.mockapi.io/api-v1'

export type User = {
  id: string
  name: string
  email: string
  createdAt: string
  avatar?: string
  city: string
}

export const sleep = (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms))

export const fetchUsers = async (): Promise<User[]> => {
  const response = await fetch(`${API_URL}/users`)
  return response.json()
}

export const createUser = async (user: {
  name: string
  email: string
  id: string
}): Promise<User> => {
  const response = await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(user),
  })
  if (!response.ok) {
    throw new Error('Failed to create user')
  }
  return response.json()
}

export const deleteUser = async (userId: string): Promise<void> => {
  const response = await fetch(`${API_URL}/users/${userId}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    throw new Error('Failed to delete user')
  }
}

export type Task = {
  id: string
  title: string
  done: boolean
  userId: string
  createdAt: Date
  userName?: string
}
export const fetchTasks = async ({
  page = 1,
  limit = undefined,
  title = '',
  done = undefined,
  userId = undefined,
  orderBy = 'createdAt', // Default sort by createdAt
  order = 'desc', // Default descending order
}: {
  page?: number
  limit?: number
  title?: string
  userId?: User['id']
  orderBy?: string
  search?: string
  order?: 'asc' | 'desc'
  done?: boolean
}): Promise<Task[]> => {
  const url = new URL(
    `${API_URL}/tasks?page=${page}&limit=${
      limit || 10
    }&orderBy=${orderBy}&order=${order}&userId=${
      userId || ''
    }&title=${title}&done=${done === undefined ? '' : done}`,
  )

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: { 'content-type': 'application/json' },
  })

  if (response.status === 404) return []
  if (!response.ok) throw new Error('Failed to fetch tasks')
  return response.json()
}

export const createTask = async (task: Task): Promise<Task> => {
  const response = await fetch(`${API_URL}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(task),
  })

  if (!response.ok) {
    throw new Error('Failed to create task')
  }
  return response.json()
}

export const updateTask = async (
  taskId: string,
  updates: Partial<Omit<Task, 'id' | 'createdAt'>>,
): Promise<Task> => {
  const response = await fetch(`${API_URL}/tasks/${taskId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  })
  if (!response.ok) {
    throw new Error('Failed to update task')
  }
  return response.json()
}

export const deleteTask = async (taskId: string): Promise<void> => {
  const response = await fetch(`${API_URL}/tasks/${taskId}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    throw new Error('Failed to delete task')
  }
}
