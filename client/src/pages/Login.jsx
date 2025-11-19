import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
/*
  Login component allows users to log into their accounts.
  It uses the useAuth hook to access the loginUser function from AuthContext.
  The component maintains local state for email and password inputs.
  On form submission, it calls loginUser with the entered credentials.
*/
export default function login() {
  const { loginUser } = useAuth(); // calling useAuth to get loginUser function

  // Local state for email and password
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = {
      email,
      password,
    };
// call loginUser from AuthContext - service call to backend
    await loginUser(user);
  };

  // JSX for rendering the login form
  return (
    <>
    
      <h1>Login</h1>
      <form onSubmit={handleSubmit} className="form">
        <input
          type="email"
          placeholder="Email"
          className="form-inputs"
          value={email}
          onChange={({ target }) => setEmail(target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="form-inputs"
          value={password}
          onChange={({ target }) => setPassword(target.value)}
        />
        <button type="submit">Login to StudyZone</button>
      </form>
    </>
  );
}