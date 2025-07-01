import React, { createContext } from 'react';

// Create Context
export const AppContext = createContext();

// Create Provider
export const AppProvider = ({ children }) => {
  const backendUrl = 'https://8590-103-105-227-34.ngrok-free.app';  // <--- your backend URL

  return (
    <AppContext.Provider value={{ backendUrl }}>
      {children}
    </AppContext.Provider>
  );
};
