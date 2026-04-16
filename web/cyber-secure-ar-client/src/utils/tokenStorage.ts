const TOKEN_KEY = "csar_token";
const USER_KEY  = "csar_user";

export const tokenStorage = {
  setToken: (token: string): void => {
    sessionStorage.setItem(TOKEN_KEY, token);
  },
  getToken: (): string | null => {
    return sessionStorage.getItem(TOKEN_KEY);
  },
  removeToken: (): void => {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  },
  setUser: (user: object): void => {
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  getUser: <T>(): T | null => {
    const raw = sessionStorage.getItem(USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  },
  isAuthenticated: (): boolean => {
    return !!sessionStorage.getItem(TOKEN_KEY);
  },
};