import { app } from "../firebaseConfig";
import React, { useContext, useState, useEffect } from "react";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateEmail,
  updatePassword,
  onAuthStateChanged,
  User
} from "firebase/auth";

interface AuthContextInterface {
  user: User | null,
  signup: (email: string, password: string) => void,
  login: (email : string, password : string) => void,
  logout: () => void,
  resetPassword: (email : string) => void,
  updateUserEmail: (email: string) => void,
  updateUserPassword: (email: string) => void,
}

const AuthContext = React.createContext<AuthContextInterface | undefined>(undefined);

export function useAuth() {
  const authContext = useContext(AuthContext);
  if (authContext === undefined) {
    throw new Error("useAuth must be used within a CountProvider");
  }
  return authContext;
}

export function AuthProvider({ children } : { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth(app);

  function signup(email : string, password : string) {
    createUserWithEmailAndPassword(auth, email, password);
  }

  function login(email : string, password : string) {
    signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    signOut(auth);
  }

  function resetPassword(email : string) {
    sendPasswordResetEmail(auth, email);
  }

  function updateUserEmail(email : string) {
    if (!currentUser) {
      throw new Error("Error updating email. Current user is undefined.");
    }
    updateEmail(currentUser, email);
  }

  function updateUserPassword(password : string) {
    if (!currentUser) {
      throw new Error("Error updating password. Current user is undefined.");
    }
    updatePassword(currentUser, password);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextInterface = {
    user: currentUser,
    login,
    signup,
    logout,
    resetPassword,
    updateUserEmail,
    updateUserPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
