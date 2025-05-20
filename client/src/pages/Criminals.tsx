import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Criminal } from "@/types";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { CriminalDetail } from "@/components/criminals/CriminalDetail";
import { CriminalForm } from "@/components/criminals/CriminalForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Plus, Eye, Pencil } from "lucide-react";
import { formatDate, getStatusColor, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";

export default function Criminals() {
  const [selectedCriminal, setSelectedCriminal] = useState<Criminal | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isOfficer = user?.role === 'officer';
  const canManageCriminals = isAdmin || isOfficer;

  const { data: criminals = [], isLoading } = useQuery<Criminal[]>({
    queryKey: ["/api/criminals"],
  });

  const handleAddNew = () => {
    setSelectedCriminal(null);
    setShowForm(true);
  };

  const handleEdit = (criminal: Criminal) => {
    setSelectedCriminal(criminal);
    setShowForm(true);
  };

  const handleView = (criminal: Criminal) => {
    setSelectedCriminal(criminal);
    setShowDetail(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
  };

  const handleFormCancel = () => {
    setShowForm(false);
  };

  const columns = [
    {
      header: "ID",
      accessorKey: "id",
      cell: (criminal: Criminal) => (
        <span className="font-mono text-sm">{criminal.id}</span>
      ),
    },
    {
      header: "Criminal",
      accessorKey: (criminal: Criminal) => (
        <div className="flex items-center">
          <Avatar className="h-10 w-10 mr-3">
            <AvatarImage src={criminal.photoUrl} alt={`${criminal.firstName} ${criminal.lastName}`} />
            <AvatarFallback>{criminal.firstName[0]}{criminal.lastName[0]}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{criminal.firstName} {criminal.lastName}</div>
            <div className="text-sm text-muted-foreground">Age: {criminal.age}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Crime Type",
      accessorKey: "crimeTypes",
      cell: (criminal: Criminal) => (
        <span>{criminal.crimeTypes.join(", ")}</span>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (criminal: Criminal) => (
        <Badge className={cn("capitalize", getStatusColor(criminal.status))}>
          {criminal.status}
        </Badge>
      ),
    },
    {
      header: "Last Crime Date",
      accessorKey: "lastCrimeDate",
      cell: (criminal: Criminal) => (
        <span>{formatDate(criminal.lastCrimeDate)}</span>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Criminal Records</h2>
          <p className="mt-1 text-sm text-gray-600">Manage and view details of registered criminals.</p>
        </div>
        {canManageCriminals && (
          <Button onClick={handleAddNew} className="flex items-center">
            <Plus className="mr-2 h-4 w-4" />
            Add Criminal
          </Button>
        )}
      </div>

      <DataTable
        data={criminals}
        columns={columns}
        searchPlaceholder="Search by name, ID, or crime type..."
        filterOptions={[
          {
            key: "status" as keyof Criminal,
            label: "Status",
            options: [
              { value: "active", label: "Active" },
              { value: "incarcerated", label: "Incarcerated" },
              { value: "released", label: "Released" },
              { value: "wanted", label: "Wanted" },
            ],
          },
          {
            key: "gender" as keyof Criminal,
            label: "Gender",
            options: [
              { value: "male", label: "Male" },
              { value: "female", label: "Female" },
              { value: "other", label: "Other" },
            ],
          },
        ]}
        actionButtons={(criminal) => (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleView(criminal);
              }}
            >
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            {canManageCriminals && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(criminal);
                }}
              >
                <Pencil className="h-4 w-4 mr-1" />
                Edit
              </Button>
            )}
          </>
        )}
        onRowClick={handleView}
        isLoading={isLoading}
      />

      {/* Criminal detail modal */}
      <CriminalDetail
        criminal={selectedCriminal}
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
      />

      {/* Criminal form modal */}
      <Dialog open={showForm} onOpenChange={(open) => !open && setShowForm(false)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedCriminal ? "Edit Criminal" : "Add New Criminal"}</DialogTitle>
            <DialogDescription>
              {selectedCriminal
                ? "Update the information for this criminal record."
                : "Enter the details to add a new criminal record."}
            </DialogDescription>
          </DialogHeader>
          <CriminalForm
            criminal={selectedCriminal}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
