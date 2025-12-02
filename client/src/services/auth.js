const END_POINT = '/api/login';

export const loginUser = async (userData) => {
  console.log('AuthService: Logging in user with data:', userData);
  const res = await fetch(END_POINT, {
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
