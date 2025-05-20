import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FirDetail } from "@/types";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { FirDetail as FirDetailComponent } from "@/components/fir/FirDetail";
import { FirForm } from "@/components/fir/FirForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Plus, Eye, Pencil } from "lucide-react";
import { formatDate, getStatusColor, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";

export default function FirDetails() {
  const [selectedFir, setSelectedFir] = useState<FirDetail | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isOfficer = user?.role === 'officer';
  const canManageFir = isAdmin || isOfficer;

  const { data: firRecords = [], isLoading } = useQuery<FirDetail[]>({
    queryKey: ["/api/fir"],
  });

  const handleAddNew = () => {
    setSelectedFir(null);
    setShowForm(true);
  };

  const handleEdit = (fir: FirDetail) => {
    setSelectedFir(fir);
    setShowForm(true);
  };

  const handleView = (fir: FirDetail) => {
    setSelectedFir(fir);
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
      header: "FIR ID",
      accessorKey: "id",
      cell: (fir: FirDetail) => (
        <span className="font-mono text-sm">{fir.id}</span>
      ),
    },
    {
      header: "Complainant",
      accessorKey: "complainantName",
      cell: (fir: FirDetail) => (
        <div>
          <div className="font-medium">{fir.complainantName}</div>
          <div className="text-xs text-muted-foreground">ID: {fir.complainantId}</div>
        </div>
      ),
    },
    {
      header: "Date Filed",
      accessorKey: "dateFiled",
      cell: (fir: FirDetail) => <span>{formatDate(fir.dateFiled)}</span>,
    },
    {
      header: "Incident Type",
      accessorKey: "incidentType",
    },
    {
      header: "Station",
      accessorKey: "stationName",
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (fir: FirDetail) => (
        <Badge className={cn("capitalize", getStatusColor(fir.status))}>
          {fir.status}
        </Badge>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">FIR Details</h2>
          <p className="mt-1 text-sm text-gray-600">First Information Reports and case registrations.</p>
        </div>
        <Button onClick={handleAddNew} className="flex items-center">
          <Plus className="mr-2 h-4 w-4" />
          Register New FIR
        </Button>
      </div>

      <DataTable
        data={firRecords}
        columns={columns}
        searchPlaceholder="Search by FIR ID, complainant name..."
        filterOptions={[
          {
            key: "status" as keyof FirDetail,
            label: "Status",
            options: [
              { value: "new", label: "New" },
              { value: "investigating", label: "Under Investigation" },
              { value: "resolved", label: "Resolved" },
              { value: "closed", label: "Closed" },
            ],
          },
          {
            key: "stationName" as keyof FirDetail,
            label: "Station",
            options: Array.from(new Set(firRecords.map((fir) => fir.stationName))).map((name) => ({
              value: name,
              label: name,
            })),
          },
        ]}
        actionButtons={(fir) => (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleView(fir);
              }}
            >
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            {canManageFir && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(fir);
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

      {/* FIR detail modal */}
      <FirDetailComponent
        fir={selectedFir}
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
      />

      {/* FIR form modal */}
      <Dialog open={showForm} onOpenChange={(open) => !open && setShowForm(false)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedFir ? "Edit FIR Details" : "Register New FIR"}</DialogTitle>
            <DialogDescription>
              {selectedFir
                ? "Update the information for this FIR."
                : "Enter the details to register a new FIR."}
            </DialogDescription>
          </DialogHeader>
          <FirForm
            fir={selectedFir}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
