import MainRouter from './routes/MainRouter';
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
