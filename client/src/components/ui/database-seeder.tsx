import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Database, ServerOff } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export function DatabaseSeeder() {
  const [isSeeding, setIsSeeding] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if seeding is available
  const { data: seedStatus, isLoading: isStatusLoading } = useQuery({
    queryKey: ["/api/seed/status"],
    retry: 1,
  });

  // Mutation for seeding the database
  const seedMutation = useMutation({
    mutationFn: async () => {
      setIsSeeding(true);
      const response = await fetch("/api/seed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to seed database");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Database Seeded Successfully",
        description: `Created ${data.recordsCreated.total} records across all entities.`,
        variant: "default",
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/charts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/police-stations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/officers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/criminals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/fir"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Seeding Failed",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSeeding(false);
    }
  });

  // Handle seed button click
  const handleSeedDatabase = () => {
    if (window.confirm("This will populate the database with 500+ sample records. Continue?")) {
      seedMutation.mutate();
    }
  };

  if (isStatusLoading) {
    return (
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>Loading...</CardTitle>
          <CardDescription>Checking database seeding status</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!seedStatus?.canSeed) {
    return null;
  }

  return (
    <Card className="mb-6 border-dashed border-2 border-blue-200">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-blue-500" />
          <CardTitle>Populate Database</CardTitle>
        </div>
        <CardDescription>
          Instantly populate the system with realistic crime records, officers, and more
        </CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-gray-500">
        <p>Generate 500+ records across the following entities:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Police Stations (20)</li>
          <li>Officers (100)</li>
          <li>Criminals (200)</li>
          <li>Crime Types (15)</li>
          <li>FIR Records (200)</li>
          <li>Activities (100+)</li>
        </ul>

        {seedMutation.isError && (
          <Alert variant="destructive" className="mt-4">
            <ServerOff className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {seedMutation.error.message}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          variant="default" 
          className="w-full bg-blue-600 hover:bg-blue-700"
          onClick={handleSeedDatabase}
          disabled={isSeeding || seedMutation.isPending}
        >
          {isSeeding ? "Populating Database..." : "Populate Database with 500+ Records"}
        </Button>
      </CardFooter>
    </Card>
  );
}