const END_POINT = '/api/users';

export const registerUser = async (user) => {
  const res = await fetch(END_POINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(user),
  });

  if (res.status !== 200) {
    return { error: true, message: 'A problem occured during registration. Please try again.' };
  }

  return await res.json();
};
