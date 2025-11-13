import { useState } from 'react';
import { useNavigate } from 'react-router';

export default function login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  let navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = {
      email,
      password,
    };

    // const result = await loginUser(user);
    // if (result.error) navigate('/error', { state: result.message });
    // else navigate('/quizlist');
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
