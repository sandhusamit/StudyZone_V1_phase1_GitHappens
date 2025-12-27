const END_POINT = '/api/login';

export const loginUser = async (userData) => {
  console.log('AuthService: Logging in user with data:', userData);

  const res = await fetch(END_POINT, {
    method: 'POST',
    credentials: 'include',
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  if (!res.ok) {
    return { hasError: true, message: 'A problem occurred logging in.' };
  }

  const { user, token } = await res.json();

  return { hasError: false, user, token };
};


export const logoutUser = async () => {
  await fetch('/api/logout', {
    method: 'POST',
    credentials: 'include',
  });
  return { hasError: false, message: 'Logged out successfully.' };
}


export const emailOtp = async (email) => {
  const res = await fetch("/api/otp-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (res.status === 403) {
    return {
      hasError: true,
      message: "3 maximum attempts reached. Please wait 1 hour.",
    };
  }

  if (!res.ok) {
    return {
      hasError: true,
      message: "A problem occurred sending OTP.",
    };
  }

  return {
    hasError: false,
    message: "OTP sent successfully.",
  };
};
