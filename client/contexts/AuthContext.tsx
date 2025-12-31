import React, { createContext, useContext, useState, useEffect } from "react";

export type UserRole = "co-president" | "vp" | "team-member" | "volunteer";
export type Portfolio =
  | "charity"
  | "events"
  | "finance"
  | "marketing"
  | "internals"
  | "advocacy"
  | "externals";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  portfolio?: Portfolio;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("irc_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem("irc_user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const mockUsers: Record<string, User> = {
        "president@irc.ca": {
          id: "1",
          email: "president@irc.ca",
          name: "Alex Khan",
          role: "co-president",
        },
        "vp-events@irc.ca": {
          id: "2",
          email: "vp-events@irc.ca",
          name: "Sarah Ahmed",
          role: "vp",
          portfolio: "events",
        },
        "vp-finance@irc.ca": {
          id: "3",
          email: "vp-finance@irc.ca",
          name: "Mohammad Hassan",
          role: "vp",
          portfolio: "finance",
        },
        "vp-charity@irc.ca": {
          id: "4",
          email: "vp-charity@irc.ca",
          name: "Fatima Malik",
          role: "vp",
          portfolio: "charity",
        },
        "vp-marketing@irc.ca": {
          id: "5",
          email: "vp-marketing@irc.ca",
          name: "Hassan Ibrahim",
          role: "vp",
          portfolio: "marketing",
        },
        "vp-internals@irc.ca": {
          id: "6",
          email: "vp-internals@irc.ca",
          name: "Zainab Ali",
          role: "vp",
          portfolio: "internals",
        },
        "vp-advocacy@irc.ca": {
          id: "7",
          email: "vp-advocacy@irc.ca",
          name: "Omar Rashid",
          role: "vp",
          portfolio: "advocacy",
        },
        "vp-externals@irc.ca": {
          id: "8",
          email: "vp-externals@irc.ca",
          name: "Layla Hassan",
          role: "vp",
          portfolio: "externals",
        },
        "member@irc.ca": {
          id: "9",
          email: "member@irc.ca",
          name: "Amir Khan",
          role: "team-member",
          portfolio: "events",
        },
        "volunteer@irc.ca": {
          id: "10",
          email: "volunteer@irc.ca",
          name: "Noor Ahmed",
          role: "volunteer",
        },
      };

      const userData = mockUsers[email];
      if (userData && password === "password") {
        setUser(userData);
        localStorage.setItem("irc_user", JSON.stringify(userData));
      } else {
        throw new Error("Invalid email or password");
      }
    } catch (error) {
      setUser(null);
      localStorage.removeItem("irc_user");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("irc_user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
