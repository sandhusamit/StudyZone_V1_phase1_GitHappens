import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '/Users/samitsandhu/Desktop/MERN/StudyZone_GitHappens/client/src/components/GlobalStyle.css'
import App from './App.jsx'
import { BrowserRouter as Router } from 'react-router-dom'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <App />
    </Router>
  </StrictMode>,
)

