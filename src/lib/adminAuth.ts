const ADMIN_EMAIL = "miramorenow@gmail.com";
const ADMIN_PASSWORD = "miramorenow";
const SESSION_KEY = "miramore_admin_session";

export const adminLogin = (email: string, password: string): boolean => {
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ email, loggedInAt: Date.now() }));
    return true;
  }
  return false;
};

export const isAdminLoggedIn = (): boolean => {
  return sessionStorage.getItem(SESSION_KEY) !== null;
};

export const adminLogout = () => {
  sessionStorage.removeItem(SESSION_KEY);
};
