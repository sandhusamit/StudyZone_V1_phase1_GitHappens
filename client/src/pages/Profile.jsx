import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Profile.css';

export default function Profile() {
  const { isLoggedIn, authUserId, getCurrentUserData } = useAuth();
  const [userData, setUserData] = useState({});

  useEffect(() => {
    if (isLoggedIn) {
      getCurrentUserData()
        .then((user) => {
          const { firstName, lastName, email } = user;
          setUserData({ ...userData, firstName, lastName, email });
        })
        .catch((err) => console.log(err));
    }
  }, []);

  return isLoggedIn ? (
    <>
      <h1>Profile Information</h1>
      <div className="profile">
        <div>ID: {authUserId} </div>
        <br />
        <div>First Name: {userData.firstName} </div>
        <br />
        <div>Last Name: {userData.lastName} </div>
        <br />
        <div>Email: {userData.email} </div>
      </div>
    </>
  ) : (
    <>
      <h2>Login to Access Profile</h2>
    </>
  );
}
