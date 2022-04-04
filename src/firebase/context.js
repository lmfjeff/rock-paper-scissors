import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { firebaseAuth } from './firebase';

// global context of user

export const AuthContext = React.createContext();

export const AuthProvider = ({ children }) => {
  const [user, authLoading, authError] = useAuthState(firebaseAuth);

  return (
    <AuthContext.Provider value={{ user, authLoading, authError}}>
      {children}
    </AuthContext.Provider>
  );
};
