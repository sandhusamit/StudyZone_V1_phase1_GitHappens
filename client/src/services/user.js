const END_POINT = '/api/users';

export const registerUser = async (userData) => {
  const res = await fetch(END_POINT, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (res.status === 409) {
    return { status: 409 };
  }

  if (!res.ok) {
    return {
      hasError: true,
      message: 'A problem occurred during registration.',
    };
  }

  const { user } = await res.json();
  return { hasError: false, user };
};


export const getUserDataById = async (userId) => {
  const res = await fetch(`${END_POINT}/${userId}`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    return {
      hasError: true,
      message: 'Failed to fetch user data.',
    };
  }

  const user = await res.json();
  return { hasError: false, user };
};

