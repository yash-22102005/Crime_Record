import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FirDetail, PoliceStation } from "@/types";
import { generateId } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient, useQuery } from "@tanstack/react-query";

const firFormSchema = z.object({
  complainantName: z.string().min(2, {
    message: "Complainant name must be at least 2 characters.",
  }),
  complainantId: z.string().min(2, {
    message: "Complainant ID must be at least 2 characters.",
  }),
  dateFiled: z.string(),
  incidentType: z.string().min(2, {
    message: "Incident type must be at least 2 characters.",
  }),
  stationId: z.string().min(2, {
    message: "Please select a police station.",
  }),
  description: z.string().optional(),
  status: z.enum(["new", "investigating", "resolved", "closed"]),
});

type FirFormValues = z.infer<typeof firFormSchema>;

interface FirFormProps {
  fir?: FirDetail;
  onSuccess: () => void;
  onCancel: () => void;
}

export function FirForm({ fir, onSuccess, onCancel }: FirFormProps) {
  const isEditMode = !!fir;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch police stations for the dropdown
  const { data: policeStations = [] } = useQuery<PoliceStation[]>({
    queryKey: ["/api/police-stations"],
  });

  const defaultValues: Partial<FirFormValues> = fir
    ? {
        complainantName: fir.complainantName,
        complainantId: fir.complainantId,
        dateFiled: fir.dateFiled,
        incidentType: fir.incidentType,
        stationId: fir.stationId,
        description: "",
        status: fir.status,
      }
    : {
        complainantName: "",
        complainantId: "",
        dateFiled: new Date().toISOString().split("T")[0],
        incidentType: "",
        stationId: "",
        description: "",
        status: "new",
      };

  const form = useForm<FirFormValues>({
    resolver: zodResolver(firFormSchema),
    defaultValues,
  });

  async function onSubmit(values: FirFormValues) {
    setIsSubmitting(true);

    try {
      // Find selected station name
      const selectedStation = policeStations.find(
        (station) => station.id === values.stationId
      );

      const firData: FirDetail = {
        id: fir?.id || generateId("FIR"),
        complainantName: values.complainantName,
        complainantId: values.complainantId,
        dateFiled: values.dateFiled,
        incidentType: values.incidentType,
        stationId: values.stationId,
        stationName: selectedStation?.name || "",
        status: values.status,
      };

      // Submit data
      if (isEditMode) {
        await apiRequest("PATCH", `/api/fir/${fir.id}`, firData);
        toast({
          title: "FIR updated",
          description: `Successfully updated FIR #${fir.id}`,
        });
      } else {
        await apiRequest("POST", "/api/fir", firData);
        toast({
          title: "FIR created",
          description: `Successfully registered new FIR`,
        });
      }

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["/api/fir"] });
      onSuccess();
    } catch (error) {
      console.error("Error submitting FIR data:", error);
      toast({
        title: "Error",
        description: `Failed to ${isEditMode ? "update" : "create"} FIR. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="complainantName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Complainant Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="complainantId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Complainant ID</FormLabel>
                <FormControl>
                  <Input placeholder="Enter ID number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="dateFiled"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date Filed</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="incidentType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Incident Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select incident type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Theft">Theft</SelectItem>
                    <SelectItem value="Assault">Assault</SelectItem>
                    <SelectItem value="Burglary">Burglary</SelectItem>
                    <SelectItem value="Vehicle Theft">Vehicle Theft</SelectItem>
                    <SelectItem value="Fraud">Fraud</SelectItem>
                    <SelectItem value="Harassment">Harassment</SelectItem>
                    <SelectItem value="Vandalism">Vandalism</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="stationId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Police Station</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select police station" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {policeStations.map((station) => (
                      <SelectItem key={station.id} value={station.id}>
                        {station.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="investigating">Under Investigation</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Incident Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter details about the incident"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onCancel} type="button">
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : isEditMode ? "Update FIR" : "Register FIR"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
