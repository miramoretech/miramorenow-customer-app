const SESSION_KEY = "miramore_rider_session";

export interface RiderSession {
  id: string;
  name: string;
  email: string;
}

export const riderLogin = (rider: RiderSession) => {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(rider));
};

export const getRiderSession = (): RiderSession | null => {
  const data = sessionStorage.getItem(SESSION_KEY);
  return data ? JSON.parse(data) : null;
};

export const isRiderLoggedIn = (): boolean => {
  return sessionStorage.getItem(SESSION_KEY) !== null;
};

export const riderLogout = () => {
  sessionStorage.removeItem(SESSION_KEY);
};
