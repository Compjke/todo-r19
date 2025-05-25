import { useState, useEffect, useCallback, startTransition } from 'react'
import { fetchTasks } from '../../../shared/api'
import { debounce } from '../helper'

type SortType = 'completed' | 'incompleted' | 'all' | 'undefined'

export const useTasks = ({ userId }: { userId: string }) => {
  // Pagination state
  const [page, setPage] = useState(1)
  const [limit] = useState<number>(10)
  const [totalTasks, setTotalTasks] = useState(0)
  const [searchTitle, setSearchTitle] = useState('')
  const [sortType, setSortType] = useState<SortType>('all')

  // Fetch tasks with pagination
  const [tasksPromise, setTasksPromise] = useState(() =>
    fetchTasks({ userId, page, limit }),
  )
  const [totalTasksPromise] = useState(() =>
    fetchTasks({ userId, limit: 1000, title: searchTitle }),
  )
  // Calculate total tasks (runs once)
  useEffect(() => {
    totalTasksPromise
      .then(tasks => {
        setTotalTasks(tasks.length)
      })
      .catch(error => {
        console.error('Error fetching total tasks:', error)
        setTotalTasks(0) // Fallback in case of error
      })
  }, [totalTasksPromise])

  const refetchTasks = (newPage?: number) => {
    setTasksPromise(
      fetchTasks({
        userId,
        page: newPage ?? page,
        limit: 10,
        title: searchTitle,
        done:
          sortType === 'completed'
            ? true
            : sortType === 'incompleted'
            ? false
            : undefined,
        order: 'desc',
      }),
    )
  }

  // Calculate total pages
  const totalPages = Math.ceil(totalTasks / limit)

  // Handle page navigation
  const goToPage = (action: 'first' | 'last') => {
    setPage(prev => {
      let newPage = prev
      if (action === 'first') {
        newPage = 1
      } else if (action === 'last') {
        newPage = totalPages
      }
      refetchTasks(newPage) // Fetch with the new page immediately
      return newPage
    })
  }

  // Function to jump to a specific page
  const goToSpecificPage = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setPage(pageNumber)
      refetchTasks(pageNumber)
    }
  }

  const searchTasksDebounced = useCallback(
    debounce((value: string) => {
      startTransition(() => {
        setTasksPromise(
          fetchTasks({
            userId,
            page: 1,
            limit,
            orderBy: 'createdAt',
            order: 'desc',
            title: value.length > 0 ? value : '', // Use empty string if no search term
          }),
        )
        setPage(1)
      })
    }, 1000),
    [],
  )

  const handleChangeSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim()

    if (value === searchTitle) return // No change, do nothing
    setSearchTitle(value)
    searchTasksDebounced(value)
  }

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as SortType
    setSortType(value)
    startTransition(() => {
      setTasksPromise(
        fetchTasks({
          userId,
          page: 1,
          limit,
          order: 'desc',
          title: searchTitle,
          done:
            value === 'completed'
              ? true
              : value === 'incompleted'
              ? false
              : undefined,
        }),
      )
      setPage(1)
    })
  }

  return {
    tasksPromise,
    totalPages,
    page,
    setPage,
    refetchTasks,
    goToPage,
    goToSpecificPage,
    searchTitle,
    handleChangeSearch,
    sortType,
    handleSortChange,
    setTasksPromise,
  }
}
