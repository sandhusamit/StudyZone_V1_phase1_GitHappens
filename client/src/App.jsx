import MainRouter from './routes/MainRouter';
import { AuthProvider } from './contexts/AuthContext';

import '/Users/samitsandhu/Desktop/MERN/StudyZone_GitHappens/client/src/components/GlobalStyle.css';

function App() {
  return (
    <AuthProvider>
      <MainRouter />
    </AuthProvider>
  );
}
export default App;
