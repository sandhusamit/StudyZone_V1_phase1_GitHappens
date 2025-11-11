//import { useState } from 'react'
//import reactLogo from './assets/react.svg'
//import viteLogo from '/vite.svg'
import { BrowserRouter as Router, Routes, Route, Link  } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css';

import './App.css'
import Home from './components/home.jsx';
function App() {
return (
<>
  <div>
    <Router>
      <Routes>
        <Route path="/" element={<Home /> } />
      </Routes>
    </Router>
  </div>
</>
)
}
export default App