import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function login() {
  const { loginUser } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = {
      email,
      password,
    };

    await loginUser(user);
  };

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
