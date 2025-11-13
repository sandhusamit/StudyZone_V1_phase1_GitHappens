import { useState } from 'react';
import { useNavigate } from 'react-router';

export default function Register() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  let navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = {
      firstName,
      lastName,
      username,
      email,
      password,
    };

    // const result = await createUser(user);
    // if (result.error) navigate('/error', { state: result.message });
    // else navigate('/login');
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
          onChange={({ target }) => setFirstName(target.value)}
        />

        <input
          type="text"
          placeholder="Last Name"
          className="form-inputs"
          value={lastName}
          onChange={({ target }) => setLastName(target.value)}
        />

        <input
          type="text"
          placeholder="Username"
          className="form-inputs"
          value={username}
          onChange={({ target }) => setUsername(target.value)}
        />

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
        <button type="submit">Create Account</button>
      </form>
    </>
  );
}
