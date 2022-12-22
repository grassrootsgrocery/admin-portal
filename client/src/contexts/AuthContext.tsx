import React, { useContext, useState, useEffect } from "react";

interface AuthContextInterface {
  token: string | null;
  setToken: React.Dispatch<React.SetStateAction<string | null>>;
}

const AuthContext = React.createContext<AuthContextInterface | undefined>(
  undefined
);

export function useAuth() {
  const authContext = useContext(AuthContext);
  if (authContext === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return authContext;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const tokenFromLocalStorage = localStorage.getItem("token") || null;
    if (tokenFromLocalStorage) {
      setToken(tokenFromLocalStorage);
    }
    setLoading(false);
  }, []);

  const value: AuthContextInterface = {
    token,
    setToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
