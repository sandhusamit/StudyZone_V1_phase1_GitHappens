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

  if (res.status === 404) {
    return { hasError: true, message: 'User not found.' };
  }
  if (res.status === 401) {
    return { hasError: true, message: 'Invalid credentials.' };
  }

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

export const verifyEmailOtp = async (email, otp) => {
  const res = await fetch("/api/verify-otp-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp }),
  });

  if (res.status === 401) {
    return {
      hasError: true,
      message: res.message || "Invalid OTP code.",
    };
  }
  if (res.status === 400) {
    return {
      hasError: true,
      message: res.message || "Something went wrong verifying OTP.",
    };
  }
  if (res.status === 404) {
    return {
      hasError: true,
      message: "OTP not found. Please request a new one.",
    };
  }

  if (res.status === 200) {
    const data = await res.json();
    return {
      hasError: false,
      message: data.message || "Email verified successfully.",
    };
  }
}

export const setup2fa = async (email) => {
  const res = await fetch('/api/setup-2fa', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  if (!res.ok) {
    return {
      hasError: true,
      message: 'A problem occurred setting up 2FA.',
    };
  }

  const data = await res.json();
  return {
    hasError: false,
    qrCodeImageUrl: data.qrCodeImageUrl,
  };
}

export const verify2fa = async (email, token) => {
  const res = await fetch('/api/verify-2fa', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, token }),
  });

  if (!res.ok) {
    return {
      hasError: true,
      message: 'Invalid OTP code.',
    };
  }

  return {
    hasError: false,
    message: '2FA verified successfully.',
  };
} 

export const verifyOTP = async (email, token) => {
  const res = await fetch('/api/verify-2fa-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, token }),
  });

  if (!res.ok) {
    return {
      hasError: true,
      message: 'Invalid OTP code.',
    };
  }

  const data = await res.json();
  return {
    hasError: false,
    message: 'Login successful.',
    user: data.user,
  };
}
