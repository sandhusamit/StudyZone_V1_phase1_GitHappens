// import { getToken, setToken, removeToken } from '../utils/token';

const END_POINT = '/api';

export const loginUser = async (user) => {
  // const res = await fetch(`${END_POINT}/login`, {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify(user),
  // });
  // if (res.status !== 200) {
  //   return { error: true, message: 'A problem occured logging in. Please try again.' };
  // }
  // const { token } = await res.json();
  // if (token) setToken(token);
  // return { error: false };
};

export const logoutUser = (user) => {
  removeToken();
};
