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


export const getUserByEmail = async (email) => {
  const res = await fetch(`${END_POINT}/email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    return {
      hasError: true,
      message: 'A problem occurred during fetching user using email.',
    };
  }

  const user = await res.json();
  return { hasError: false, user };
}

export const getUserByUsername = async (username) => {
  const res = await fetch('/api/users/username', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username }),
  });

  const data = await res.json();

  if (!res.ok) {
    return {
      hasError: true,
      message: data.message || 'Request failed',
    };
  }

  return { hasError: false, user: data.user };
};

