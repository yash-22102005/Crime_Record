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
import { FirDetail as FirDetailType } from "@/types";
import { formatDate, getStatusColor, cn } from "@/lib/utils";
import { FirForm } from "./FirForm";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, User, MapPin, FileText } from "lucide-react";

interface FirDetailProps {
  fir: FirDetailType | null;
  isOpen: boolean;
  onClose: () => void;
}

export function FirDetail({ fir, isOpen, onClose }: FirDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    if (!fir) return;
    
    try {
      await apiRequest("DELETE", `/api/fir/${fir.id}`, undefined);
      
      toast({
        title: "FIR deleted",
        description: `Successfully deleted FIR #${fir.id}`
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/fir"] });
      onClose();
    } catch (error) {
      console.error("Error deleting FIR:", error);
      toast({
        title: "Error",
        description: "Failed to delete FIR. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!fir) return null;

  if (isEditing) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit FIR Details</DialogTitle>
            <DialogDescription>
              Update the information for this FIR record.
            </DialogDescription>
          </DialogHeader>
          
          <FirForm 
            fir={fir} 
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
            <DialogTitle>FIR Details</DialogTitle>
            <DialogDescription>
              First Information Report details and status.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-primary mr-2" />
                  <h3 className="font-semibold text-lg">FIR #{fir.id}</h3>
                </div>
                <div className="flex items-center ml-7">
                  <Badge className={cn("capitalize", getStatusColor(fir.status))}>
                    {fir.status}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center">
                <CalendarDays className="h-4 w-4 text-muted-foreground mr-1" />
                <span className="text-sm text-muted-foreground">{formatDate(fir.dateFiled)}</span>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Complainant Information</h4>
              <div className="flex items-start">
                <User className="h-4 w-4 text-muted-foreground mt-0.5 mr-2" />
                <div>
                  <div className="text-sm font-medium">{fir.complainantName}</div>
                  <div className="text-xs text-muted-foreground">ID: {fir.complainantId}</div>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Incident Details</h4>
              <div className="text-sm">
                <div className="font-medium">{fir.incidentType}</div>
                <div className="flex items-start mt-1">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 mr-2" />
                  <div>
                    <div>{fir.stationName}</div>
                    <div className="text-xs text-muted-foreground">Station ID: {fir.stationId}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Case Status</h4>
              <p className="text-sm text-muted-foreground">
                {fir.status === "new" 
                  ? "This case has been newly registered and is pending assignment."
                  : fir.status === "investigating"
                  ? "This case is currently under investigation by the assigned officers."
                  : fir.status === "resolved"
                  ? "This case has been resolved. Final reports are being prepared."
                  : "This case has been closed. All proceedings have been completed."}
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
              This will permanently delete FIR #{fir.id}.
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
