import { Route, Routes } from "react-router";
import { UserPage } from "../pages/users";
import { TaskPage } from "../pages/tasks";
import { Header } from "../components";

const App = () => {
  return (
    <Routes>
      <Route element={<Header />}>
        <Route path="/" element={<UserPage />} />
        <Route path="/:userId?/tasks" element={<TaskPage />} />
      </Route>
    </Routes>
  );
};

export default App;
