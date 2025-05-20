import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PoliceStation } from "@/types";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { StationDetail } from "@/components/stations/StationDetail";
import { StationForm } from "@/components/stations/StationForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Plus, Eye, Pencil, MapPin, Phone, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function PoliceStations() {
  const [selectedStation, setSelectedStation] = useState<PoliceStation | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const { data: stations = [], isLoading } = useQuery<PoliceStation[]>({
    queryKey: ["/api/police-stations"],
  });

  const handleAddNew = () => {
    setSelectedStation(null);
    setShowForm(true);
  };

  const handleEdit = (station: PoliceStation) => {
    setSelectedStation(station);
    setShowForm(true);
  };

  const handleView = (station: PoliceStation) => {
    setSelectedStation(station);
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
      header: "Station ID",
      accessorKey: "id",
      cell: (station: PoliceStation) => (
        <span className="font-mono text-sm">{station.id}</span>
      ),
    },
    {
      header: "Name",
      accessorKey: "name",
      cell: (station: PoliceStation) => (
        <div className="font-medium">{station.name}</div>
      ),
    },
    {
      header: "Address",
      accessorKey: "address",
      cell: (station: PoliceStation) => (
        <div className="flex items-center">
          <MapPin className="h-4 w-4 text-muted-foreground mr-2" />
          <span className="truncate max-w-xs">{station.address}</span>
        </div>
      ),
    },
    {
      header: "Contact",
      accessorKey: "contact",
      cell: (station: PoliceStation) => (
        <div className="flex items-center">
          <Phone className="h-4 w-4 text-muted-foreground mr-2" />
          <span>{station.contact}</span>
        </div>
      ),
    },
    {
      header: "Officers",
      accessorKey: "officerCount",
      cell: (station: PoliceStation) => (
        <div className="flex items-center">
          <Users className="h-4 w-4 text-muted-foreground mr-2" />
          <span>{station.officerCount}</span>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Police Stations</h2>
          <p className="mt-1 text-sm text-gray-600">Manage police stations and their jurisdictions.</p>
        </div>
        {isAdmin && (
          <Button onClick={handleAddNew} className="flex items-center">
            <Plus className="mr-2 h-4 w-4" />
            Add Station
          </Button>
        )}
      </div>

      {/* Map view placeholder */}
      <div className="bg-white shadow-sm rounded-lg mb-6 p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Station Locations</h3>
        <div className="aspect-w-16 aspect-h-9 h-64 bg-gray-100 rounded-md flex items-center justify-center text-gray-500">
          <div className="flex flex-col items-center">
            <MapPin className="h-12 w-12 mb-2 text-gray-400" />
            <p className="text-sm">Interactive Map: Police Station Locations</p>
            <p className="text-xs text-gray-400 mt-1">Map would render here with station markers</p>
          </div>
        </div>
      </div>

      <DataTable
        data={stations}
        columns={columns}
        searchPlaceholder="Search by name or location..."
        actionButtons={(station) => (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleView(station);
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
                  handleEdit(station);
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

      {/* Station detail modal */}
      <StationDetail
        station={selectedStation}
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
      />

      {/* Station form modal */}
      <Dialog open={showForm} onOpenChange={(open) => !open && setShowForm(false)}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>{selectedStation ? "Edit Police Station" : "Add New Police Station"}</DialogTitle>
            <DialogDescription>
              {selectedStation
                ? "Update the information for this police station."
                : "Enter the details to add a new police station."}
            </DialogDescription>
          </DialogHeader>
          <StationForm
            station={selectedStation}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
