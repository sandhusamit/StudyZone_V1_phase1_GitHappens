import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
  const { registerUser } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = {
      firstName,
      lastName,
      username,
      email,
      password,
    };

    await registerUser(user);
  };

  return (
    <>
      <h2>Register Here </h2>
      <form onSubmit={handleSubmit} className="form">
        <input
          type="text"
          placeholder="First Name"
          className="form-inputs"
          value={firstName}
          onChange={({ target: { value } }) => setFirstName(value)}
        />

        <input
          type="text"
          placeholder="Last Name"
          className="form-inputs"
          value={lastName}
          onChange={({ target: { value } }) => setLastName(value)}
        />

        <input
          type="text"
          placeholder="Username"
          className="form-inputs"
          value={username}
          onChange={({ target: { value } }) => setUsername(value)}
        />

        <input
          type="email"
          placeholder="Email"
          className="form-inputs"
          value={email}
          onChange={({ target: { value } }) => setEmail(value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="form-inputs"
          value={password}
          onChange={({ target: { value } }) => setPassword(value)}
        />
        <button type="submit">Create Account</button>
      </form>
    </>
  );
}
