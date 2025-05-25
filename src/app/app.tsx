import { Route, Routes } from 'react-router'
import { UserPage } from '../pages/users'
import { TaskPage } from '../pages/tasks'
import { Header } from '../shared/components'
import { UserProvider } from '../entities/user'


const App = () => {
  return (
    <UserProvider>
      <Routes>
        <Route element={<Header />}>
          <Route path="/" element={<UserPage />} />
          <Route path="/:userId?/tasks" element={<TaskPage />} />
        </Route>
      </Routes>
    </UserProvider>
  )
}

export default App
