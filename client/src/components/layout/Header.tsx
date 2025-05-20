import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/ui/auth-modal";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { 
  Shield, 
  LogIn, 
  LogOut, 
  User, 
  Settings, 
  ChevronDown
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Header() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const [_, setLocation] = useLocation();

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Shield className="h-6 w-6 text-primary mr-2" />
              <h1 className="text-xl font-bold text-primary">Crime Record Management System</h1>
            </div>
          </div>
          
          <div className="flex items-center">
            {!isAuthenticated ? (
              <Button 
                className="flex items-center space-x-1"
                onClick={() => setIsAuthModalOpen(true)}
              >
                <LogIn className="h-4 w-4 mr-1" />
                <span>Login</span>
              </Button>
            ) : (
              <div className="relative ml-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="" alt={user?.username} />
                        <AvatarFallback>{user?.username?.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="ml-2 text-gray-700">{user?.username}</span>
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setLocation("/profile")}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Your Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLocation("/settings")}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={logout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </header>
  );
}
