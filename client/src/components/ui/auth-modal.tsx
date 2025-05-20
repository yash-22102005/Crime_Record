import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Shield, LogIn } from "lucide-react";
import { X } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginWithReplit = () => {
    setIsLoading(true);
    window.location.href = "/api/login";
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

        <div className="py-6">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Shield className="h-16 w-16 text-primary" />
            <h3 className="text-xl font-semibold text-center">Crime Record Management System</h3>
            <p className="text-center text-muted-foreground">
              Manage crime records, track cases, and analyze crime data efficiently.
            </p>
          </div>

          <div className="mt-8">
            <Button 
              onClick={handleLoginWithReplit} 
              className="w-full flex items-center justify-center gap-2"
              size="lg"
              disabled={isLoading}
            >
              <LogIn className="h-5 w-5" />
              {isLoading ? "Redirecting..." : "Sign in with Replit"}
            </Button>
          </div>
        </div>
        
        <div className="border-t pt-4">
          <div className="text-xs text-center text-muted-foreground">
            <p>By signing in, you agree to our terms of service and privacy policy.</p>
            <p className="mt-1">This system is for authorized personnel only.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
