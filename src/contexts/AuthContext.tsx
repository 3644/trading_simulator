import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  addFriend: (friendEmail: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      // Ensure friends array exists
      return {
        ...parsedUser,
        friends: parsedUser.friends || []
      };
    }
    return null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify({
        ...user,
        friends: user.friends || [] // Ensure friends array exists when saving
      }));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const login = async (email: string, password: string) => {
    if (password.length < 6) {
      throw new Error('Mot de passe invalide');
    }
    
    const newUser = {
      email,
      id: Math.random().toString(36).substr(2, 9),
      friends: [] // Initialize empty friends array
    };
    
    setUser(newUser);
  };

  const register = async (email: string, password: string) => {
    if (password.length < 6) {
      throw new Error('Le mot de passe doit contenir au moins 6 caractères');
    }
    
    const newUser = {
      email,
      id: Math.random().toString(36).substr(2, 9),
      friends: [] // Initialize empty friends array
    };
    
    setUser(newUser);
  };

  const addFriend = (friendEmail: string) => {
    if (user) {
      const friends = user.friends || []; // Ensure friends array exists
      if (!friends.includes(friendEmail)) {
        setUser({
          ...user,
          friends: [...friends, friendEmail]
        });
      }
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, addFriend }}>
      {children}
    </AuthContext.Provider>
  );
};