import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

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
      <h2>Profile Information</h2>
      <div className="profile">
        <div>id: {authUserId} </div>
        <div>First Name: {userData.firstName} </div>
        <div>Last Name: {userData.lastName} </div>
        <div>Email:{userData.email} </div>
      </div>
    </>
  ) : (
    <>
      <h2>Login to Access Profile</h2>
    </>
  );
}
