"use client";

import { tokenServices } from "@/api/tokenService";
import { userStorage } from "@/api/userService";
import { userDto } from "@/types/user.type";
import { createContext, useContext, useEffect, useState } from "react";

interface AuthContextData {
  user: userDto | null;
  isLoading: boolean;
  login: (
    userData: userDto,
    accessToken: string,
    refreshToken: string
  ) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<userDto | null>(null);
  const [isLoading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const bootStrapAsync = async () => {
      const user = await userStorage.getUser();
      const token = await tokenServices.getAccesToken();

      if (user && token) {
        setUser(user);
      }

      setLoading(false);
    };

    bootStrapAsync();
  }, []);

  const login = async (
    userData: userDto,
    accessToken: string,
    refreshToken: string
  ) => {
    await tokenServices.setTokens(accessToken, refreshToken);
    await userStorage.setUser(userData);
    setUser(userData);
  };

  const logout = async () => {
    await tokenServices.removeToken();
    await userStorage.removeUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);