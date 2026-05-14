import React, { createContext, useContext } from "react";
import { useGetCurrentUser } from "@workspace/api-client-react";
import type { User } from "@workspace/api-client-react";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  isAdmin: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading, isError } = useGetCurrentUser({
    query: {
      retry: false,
      staleTime: 30000,
    } as any,
  });

  const value = {
    user: user && !isError ? user : null,
    isLoading,
    isAuthenticated: !!user && !isError,
    isAdmin: !!user && !isError && (
      user.role === "admin" || 
      user.role === "superAdmin" || 
      String(user.role).toLowerCase() === "admin" || 
      String(user.role).toLowerCase() === "superadmin"
    ),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
