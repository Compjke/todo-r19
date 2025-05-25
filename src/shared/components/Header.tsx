import { NavLink, Outlet, useMatch } from 'react-router'

export const Header = () => {
  const isTaskPage = useMatch('/:userId/tasks')
  return (
    <div>
      <header className=" bg-slate-300 text-slate-800  py-4 px-8 ">
        <div className=" my-container flex items-center justify-center w-full gap-4 font-bold text-xl ">
          <NavLink
            className={({ isActive }) => {
              return isActive
                ? 'text-blue-500 underline pointer-events-none'
                : ''
            }}
            to="/"
          >
            Users
          </NavLink>
          <NavLink
            className={({ isActive }) => {
              return isActive || isTaskPage
                ? 'text-blue-500 underline pointer-events-none'
                : ''
            }}
            to="/tasks"
          >
            Tasks
          </NavLink>
        </div>
      </header>
      <Outlet />
    </div>
  )
}
