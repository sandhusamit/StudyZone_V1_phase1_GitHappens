// import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import MainRouter from './MainRouter.jsx';
import { AuthProvider } from './contexts/AuthContext';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <MainRouter />
    </AuthProvider>
  );
}
export default App;
