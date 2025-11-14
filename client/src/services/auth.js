const END_POINT = '/api';

export const loginUser = async (userData) => {
  const res = await fetch(`${END_POINT}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (res.status !== 200) {
    return { hasError: true, message: 'A problem occured logging in. Please try again.' };
  }

  const { user, token } = await res.json();
  return { hasError: false, user, token };
};

// export const logoutUser = (user) => {};
