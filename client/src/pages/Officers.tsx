import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Officer, PoliceStation } from "@/types";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { OfficerDetail } from "@/components/officers/OfficerDetail";
import { OfficerForm } from "@/components/officers/OfficerForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Plus, Eye, Pencil, Building } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";

export default function Officers() {
  const [selectedOfficer, setSelectedOfficer] = useState<Officer | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const { data: officers = [], isLoading } = useQuery<Officer[]>({
    queryKey: ["/api/officers"],
  });

  const { data: stations = [] } = useQuery<PoliceStation[]>({
    queryKey: ["/api/police-stations"],
  });

  // Merge station names into officer data
  const officersWithStationName = officers.map(officer => {
    const station = stations.find(s => s.id === officer.stationId);
    return {
      ...officer,
      stationName: station?.name || "Unknown"
    };
  });

  const handleAddNew = () => {
    setSelectedOfficer(null);
    setShowForm(true);
  };

  const handleEdit = (officer: Officer) => {
    setSelectedOfficer(officer);
    setShowForm(true);
  };

  const handleView = (officer: Officer) => {
    setSelectedOfficer(officer);
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
      header: "Officer",
      accessorKey: (officer: Officer) => (
        <div className="flex items-center">
          <Avatar className="h-10 w-10 mr-3">
            <AvatarFallback>{officer.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{officer.name}</div>
            <div className="text-sm text-muted-foreground">{officer.rank}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Badge Number",
      accessorKey: "badgeNumber",
      cell: (officer: Officer) => (
        <span className="font-mono">{officer.badgeNumber}</span>
      ),
    },
    {
      header: "Station",
      accessorKey: "stationName",
      cell: (officer: Officer) => (
        <div className="flex items-center">
          <Building className="h-4 w-4 text-muted-foreground mr-2" />
          <span>{officer.stationName}</span>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Police Officers</h2>
          <p className="mt-1 text-sm text-gray-600">Manage and view officers across all police stations.</p>
        </div>
        {isAdmin && (
          <Button onClick={handleAddNew} className="flex items-center">
            <Plus className="mr-2 h-4 w-4" />
            Add Officer
          </Button>
        )}
      </div>

      <DataTable
        data={officersWithStationName}
        columns={columns}
        searchPlaceholder="Search by name or badge number..."
        filterOptions={[
          {
            key: "stationName" as keyof Officer,
            label: "Station",
            options: Array.from(new Set(officersWithStationName.map((officer) => officer.stationName))).map((name) => ({
              value: name,
              label: name,
            })),
          },
          {
            key: "rank" as keyof Officer,
            label: "Rank",
            options: Array.from(new Set(officers.map((officer) => officer.rank))).map((rank) => ({
              value: rank,
              label: rank,
            })),
          },
        ]}
        actionButtons={(officer) => (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleView(officer);
              }}
            >
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            {isAdmin && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(officer);
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

      {/* Officer detail modal */}
      <OfficerDetail
        officer={selectedOfficer}
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
      />

      {/* Officer form modal */}
      <Dialog open={showForm} onOpenChange={(open) => !open && setShowForm(false)}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>{selectedOfficer ? "Edit Officer" : "Add New Officer"}</DialogTitle>
            <DialogDescription>
              {selectedOfficer
                ? "Update the information for this officer."
                : "Enter the details to add a new officer."}
            </DialogDescription>
          </DialogHeader>
          <OfficerForm
            officer={selectedOfficer}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
