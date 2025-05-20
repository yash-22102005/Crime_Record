import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Officer } from "@/types";
import { OfficerForm } from "./OfficerForm";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { Shield, User, Building } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface OfficerDetailProps {
  officer: Officer | null;
  isOpen: boolean;
  onClose: () => void;
}

export function OfficerDetail({ officer, isOpen, onClose }: OfficerDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    if (!officer) return;
    
    try {
      await apiRequest("DELETE", `/api/officers/${officer.id}`, undefined);
      
      toast({
        title: "Officer deleted",
        description: `Successfully deleted officer record for ${officer.name}`
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/officers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/police-stations"] });
      onClose();
    } catch (error) {
      console.error("Error deleting officer:", error);
      toast({
        title: "Error",
        description: "Failed to delete officer record. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!officer) return null;

  if (isEditing) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit Officer</DialogTitle>
            <DialogDescription>
              Update the information for this officer.
            </DialogDescription>
          </DialogHeader>
          
          <OfficerForm 
            officer={officer} 
            onSuccess={() => {
              setIsEditing(false);
              onClose();
            }}
            onCancel={() => setIsEditing(false)}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Officer Details</DialogTitle>
            <DialogDescription>
              Information about the police officer.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback>{officer.name.charAt(0)}</AvatarFallback>
              </Avatar>
              
              <div className="space-y-1">
                <h3 className="font-semibold text-lg">{officer.name}</h3>
                <div className="flex items-center">
                  <Shield className="h-4 w-4 text-primary mr-1" />
                  <span className="text-sm font-medium">{officer.rank}</span>
                </div>
                <div className="text-sm text-muted-foreground">Badge: {officer.badgeNumber}</div>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Assignment</h4>
              <div className="flex items-start">
                <Building className="h-4 w-4 text-muted-foreground mt-0.5 mr-2" />
                <div>
                  <div className="text-sm font-medium">{officer.stationName}</div>
                  <div className="text-xs text-muted-foreground">Station ID: {officer.stationId}</div>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Cases & Responsibilities</h4>
              <p className="text-sm text-muted-foreground">
                This officer is responsible for handling crime investigations 
                and maintaining public safety within their jurisdiction.
              </p>
            </div>
          </div>
          
          <DialogFooter className="space-x-2">
            <Button variant="outline" onClick={() => setIsDeleting(true)}>
              Delete
            </Button>
            <Button onClick={() => setIsEditing(true)}>
              Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the officer record for {officer.name}.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
