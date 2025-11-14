import axios from 'axios';
const END_POINT = '/api/users';

export const registerUser = async (userData) => {
  const res = await fetch(END_POINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (res.status !== 200) {
    return {
      hasError: true,
      message: 'A problem occured during registration. Please try again.',
    };
  }

  const { user, token } = await res.json();
  return { hasError: false, user, token };
};

export const getUserDataById = async (userId, token) => {
  const res = await fetch(`${END_POINT}/${userId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `$Bearer ${token}`,
    },
  });

  if (res.status !== 200) {
    return {
      hasError: true,
      message: 'A problem occured during registration. Please try again.',
    };
  }

  const user = await res.json();
  return { hasError: false, user };
};
