import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";
import { X } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError("Please enter both username and password");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      await login({ username, password, rememberMe });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to login");
    } finally {
      setIsLoading(false);
    }
  };

  // Demo quick login buttons
  const handleQuickLogin = (role: string) => {
    const roleCredentials = {
      admin: { username: "admin", password: "admin123" },
      officer: { username: "officer", password: "officer123" },
      user: { username: "user", password: "user123" },
    }[role];

    if (roleCredentials) {
      setUsername(roleCredentials.username);
      setPassword(roleCredentials.password);
      login({ ...roleCredentials, role });
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-2xl font-bold text-primary">CRMS Login</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription>Log in to access the Crime Record Management System</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="remember" 
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <Label htmlFor="remember" className="text-sm">Remember me</Label>
            </div>
            <Button variant="link" className="text-sm h-auto p-0">
              Forgot password?
            </Button>
          </div>
          
          {error && <p className="text-red-500 text-sm">{error}</p>}
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
        
        <div className="border-t pt-4">
          <div className="text-sm text-center space-y-2">
            <p className="text-muted-foreground">Quick login for demonstration:</p>
            <div className="flex justify-center space-x-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleQuickLogin("admin")}
              >
                Admin
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleQuickLogin("officer")}
              >
                Officer
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleQuickLogin("user")}
              >
                User
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
