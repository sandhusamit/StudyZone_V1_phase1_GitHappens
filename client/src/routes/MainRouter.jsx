import { Routes, Route } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import QuizList from '../pages/QuizList';
import QuizPlay from '../pages/QuizPlay';
import CreateQuiz from '../pages/CreateQuiz';
import Profile from '../pages/Profile';
import Leaderboard from '../pages/Leaderboard';
import ErrorPage from '../pages/ErrorPage';

const MainRouter = () => {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/quizlist" element={<QuizList />} />
        <Route path="/play" element={<QuizPlay />} />
        <Route path="/create" element={<CreateQuiz />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/error" element={<ErrorPage />} />
      </Routes>
    </>
  );
};

export default MainRouter;
