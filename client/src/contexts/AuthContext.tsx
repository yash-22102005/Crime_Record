import { createContext, ReactNode, useState, useEffect } from "react";
import { User } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { username: string; password: string; role?: string; rememberMe?: boolean }) => Promise<void>;
  logout: () => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Check if user is already logged in on page load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error("Auth check error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async ({ username, password, role, rememberMe }: { username: string; password: string; role?: string; rememberMe?: boolean }) => {
    setIsLoading(true);
    try {
      // In a real application, we would make an API call to authenticate
      // For this demo, we're simulating authentication
      
      // If a role is provided, we're using the demo quick login
      if (role) {
        const demoUser: User = {
          id: `user-${Math.floor(Math.random() * 1000)}`,
          username,
          role: role as 'admin' | 'officer' | 'user',
        };
        
        setUser(demoUser);
        
        if (rememberMe) {
          localStorage.setItem("user", JSON.stringify(demoUser));
        }
        
        toast({
          title: "Logged in successfully",
          description: `Welcome, ${username}!`,
        });
        
        return;
      }
      
      // Simulate API authentication
      // In a real application, this would be an actual API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      if (username === "admin" && password === "admin123") {
        const adminUser: User = {
          id: "admin-1",
          username: "admin",
          role: "admin",
        };
        setUser(adminUser);
        if (rememberMe) {
          localStorage.setItem("user", JSON.stringify(adminUser));
        }
      } else if (username === "officer" && password === "officer123") {
        const officerUser: User = {
          id: "officer-1",
          username: "officer",
          role: "officer",
        };
        setUser(officerUser);
        if (rememberMe) {
          localStorage.setItem("user", JSON.stringify(officerUser));
        }
      } else if (username === "user" && password === "user123") {
        const regularUser: User = {
          id: "user-1",
          username: "user",
          role: "user",
        };
        setUser(regularUser);
        if (rememberMe) {
          localStorage.setItem("user", JSON.stringify(regularUser));
        }
      } else {
        throw new Error("Invalid credentials");
      }
      
      toast({
        title: "Logged in successfully",
        description: `Welcome, ${username}!`,
      });
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
