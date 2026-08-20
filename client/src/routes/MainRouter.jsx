import { Routes, Route } from "react-router-dom";

import ProtectRoute from "./ProtectRoute";
import GuestRoute from "./GuestRoute";

import NavBar from "../components/NavBar";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import RegistrationUnavailable from "../pages/RegistrationUnavailable";
import Dashboard from "../pages/Dashboard";
import QuizList from "../pages/QuizList";
import QuizPlay from "../pages/QuizPlay";
import CreateQuiz from "../pages/CreateQuiz";
import Profile from "../pages/Profile";
import Leaderboard from "../pages/Leaderboard";
import ErrorPage from "../pages/ErrorPage";
import Success from "../pages/Success";
import EditQuiz from "../pages/EditQuiz";
import DiagramQuestion from "../pages/DiagramQuestion";
import CreateDiagramQuestion from "../pages/CreateDiagramQuestion";
import Whiteboard from "../components/Tools/Whiteboard";

const MainRouter = () => {
  return (
    <>
      <NavBar />

      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegistrationUnavailable />} />

        <Route path="/diagram" element={<DiagramQuestion />} />
        <Route path="/create-diagram" element={<CreateDiagramQuestion />} />

        <Route
          path="/dashboard"
          element={
            <ProtectRoute>
              <Dashboard />
            </ProtectRoute>
          }
        />

        <Route
          path="/quizlist"
          element={
            <GuestRoute>
              <QuizList />
            </GuestRoute>
          }
        />

        <Route
          path="/play/:quizId"
          element={
              <QuizPlay />
          }
        />

        <Route
          path="/edit"
          element={
            <ProtectRoute>
              <EditQuiz />
            </ProtectRoute>
          }
        />

        <Route
          path="/create"
          element={
            <ProtectRoute>
              <CreateQuiz />
            </ProtectRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectRoute>
              <Profile />
            </ProtectRoute>
          }
        />

        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/success" element={<Success />} />
        <Route path="/error" element={<ErrorPage />} />
        <Route path="/whiteboard" element={<Whiteboard />} />
      </Routes>
    </>
  );
};

export default MainRouter;