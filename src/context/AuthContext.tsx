import React, { createContext, useState, useEffect, useContext } from 'react';
import { signin, logout as apiLogout, getCurrentUser, isAuthenticated as checkIsAuthenticated } from '../api';
import { AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthContextType['user']>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const isAuth = checkIsAuthenticated();
        
        if (isAuth) {
          const currentUser = getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
            setIsAuthenticated(true);
          }
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        // Clear any invalid auth data
        apiLogout();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await signin(email, password);
      setUser(response.user);
      setIsAuthenticated(true);
      return response;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    apiLogout();
    setUser(null);
    setIsAuthenticated(false);
    window.location.href = '/';
  };

  // Function to update user data in context
  const updateUserData = (userData: Partial<NonNullable<AuthContextType['user']>>) => {
    if (user) {
      setUser({
        ...user,
        ...userData
      });
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isAuthenticated, 
      isLoading,
      updateUser: updateUserData 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};