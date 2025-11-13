import {Link} from 'react-router-dom';
import logo from '../assets/gitLogo.png';
import './NavBar.css';


function NavBar() {
    return(
        <>
       <div className="navspace">
            <nav className="navbar">
                <div className="logo-div">
                    <Link to="/"><img src ={logo} alt="Git Logo" className="logo" /></Link>
                </div>

                
                <Link to="/">Home</Link> -  
                <Link to="/login">Login</Link> - 
                <Link to="/register">Register</Link> -  
                <Link to="/dashboard">Dashboard</Link> - 
                <Link to="/quizlist">Quizzes</Link> -  
                <Link to="/play">Quiz Play</Link> -
                <Link to="/create">Create Quiz</Link> - 
                <Link to="/profile">Profile</Link> - 
                <Link to="/leaderboard">Leaderboard</Link>      
                

               
            </nav>
       </div>
        </>
    )
}
export default NavBar;