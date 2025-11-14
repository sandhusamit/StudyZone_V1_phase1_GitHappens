const TOKEN_KEY = 'bearer_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || null;
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken() {
  if (localStorage.getItem(TOKEN_KEY)) localStorage.removeItem(TOKEN_KEY);
}
