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
import { Criminal } from "@/types";
import { formatDate, getStatusColor, cn } from "@/lib/utils";
import { CriminalForm } from "./CriminalForm";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface CriminalDetailProps {
  criminal: Criminal | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CriminalDetail({ criminal, isOpen, onClose }: CriminalDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleting2, setIsDeleting2] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    if (!criminal) return;
    
    try {
      await apiRequest("DELETE", `/api/criminals/${criminal.id}`, undefined);
      
      toast({
        title: "Criminal record deleted",
        description: `Successfully deleted record for ${criminal.firstName} ${criminal.lastName}`
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/criminals"] });
      onClose();
    } catch (error) {
      console.error("Error deleting criminal:", error);
      toast({
        title: "Error",
        description: "Failed to delete criminal record. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!criminal) return null;

  if (isEditing) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Criminal Record</DialogTitle>
            <DialogDescription>
              Update the information for this criminal record.
            </DialogDescription>
          </DialogHeader>
          
          <CriminalForm 
            criminal={criminal} 
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
            <DialogTitle>Criminal Details</DialogTitle>
            <DialogDescription>
              Detailed information about the criminal record.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={criminal.photoUrl} alt={`${criminal.firstName} ${criminal.lastName}`} />
                <AvatarFallback>{criminal.firstName[0]}{criminal.lastName[0]}</AvatarFallback>
              </Avatar>
              
              <div className="space-y-1">
                <h3 className="font-semibold text-lg">{criminal.firstName} {criminal.lastName}</h3>
                <div className="text-sm text-muted-foreground">ID: {criminal.id}</div>
                <div className="text-sm text-muted-foreground">Age: {criminal.age} • Gender: {criminal.gender}</div>
                <div className="mt-2">
                  <Badge className={cn("capitalize", getStatusColor(criminal.status))}>
                    {criminal.status}
                  </Badge>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Crime Information</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm">
                  <span className="text-muted-foreground">Last Crime Date:</span>
                  <div>{formatDate(criminal.lastCrimeDate)}</div>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Crime Types:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {criminal.crimeTypes.map((type, index) => (
                      <Badge key={index} variant="outline">{type}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Case History</h4>
              <p className="text-sm text-muted-foreground">
                {criminal.status === "wanted" 
                  ? "This criminal is currently wanted. Alert all officers if spotted."
                  : criminal.status === "incarcerated"
                  ? "Currently serving sentence. Regular monitoring required."
                  : criminal.status === "released"
                  ? "Released from custody. Monitoring may be required per conditions."
                  : "Active criminal record. Maintain surveillance and update record as needed."}
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
              This will permanently delete the criminal record for {criminal.firstName} {criminal.lastName}. 
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
