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
import { PoliceStation } from "@/types";
import { StationForm } from "./StationForm";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { MapPin, Phone, Users, Building } from "lucide-react";

interface StationDetailProps {
  station: PoliceStation | null;
  isOpen: boolean;
  onClose: () => void;
}

export function StationDetail({ station, isOpen, onClose }: StationDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    if (!station) return;
    
    try {
      await apiRequest("DELETE", `/api/police-stations/${station.id}`, undefined);
      
      toast({
        title: "Police station deleted",
        description: `Successfully deleted ${station.name}`
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/police-stations"] });
      onClose();
    } catch (error) {
      console.error("Error deleting police station:", error);
      toast({
        title: "Error",
        description: "Failed to delete police station. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!station) return null;

  if (isEditing) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit Police Station</DialogTitle>
            <DialogDescription>
              Update the information for this police station.
            </DialogDescription>
          </DialogHeader>
          
          <StationForm 
            station={station} 
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
            <DialogTitle>Police Station Details</DialogTitle>
            <DialogDescription>
              Information about the police station and jurisdiction.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex items-center">
                <Building className="h-5 w-5 text-primary mr-2" />
                <h3 className="font-semibold text-lg">{station.name}</h3>
              </div>
              <div className="text-sm text-muted-foreground ml-7">ID: {station.id}</div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Station Information</h4>
              
              <div className="space-y-2">
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 mr-2" />
                  <div className="text-sm">{station.address}</div>
                </div>
                
                <div className="flex items-center">
                  <Phone className="h-4 w-4 text-muted-foreground mr-2" />
                  <div className="text-sm">{station.contact}</div>
                </div>
                
                <div className="flex items-center">
                  <Users className="h-4 w-4 text-muted-foreground mr-2" />
                  <div className="text-sm">{station.officerCount} officers assigned</div>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Station Activities</h4>
              <p className="text-sm text-muted-foreground">
                This station handles various crime reports and law enforcement activities within its jurisdiction.
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
              This will permanently delete the police station record for {station.name}. 
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
