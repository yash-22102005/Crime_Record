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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Officer, PoliceStation } from "@/types";
import { generateId } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient, useQuery } from "@tanstack/react-query";

const officerFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  badgeNumber: z.string().min(2, {
    message: "Badge number must be at least 2 characters.",
  }),
  rank: z.string().min(2, {
    message: "Rank must be at least 2 characters.",
  }),
  stationId: z.string().min(2, {
    message: "Please select a police station.",
  }),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
});

type OfficerFormValues = z.infer<typeof officerFormSchema>;

interface OfficerFormProps {
  officer?: Officer;
  onSuccess: () => void;
  onCancel: () => void;
}

export function OfficerForm({ officer, onSuccess, onCancel }: OfficerFormProps) {
  const isEditMode = !!officer;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch police stations for the dropdown
  const { data: policeStations = [] } = useQuery<PoliceStation[]>({
    queryKey: ["/api/police-stations"],
  });

  const defaultValues: Partial<OfficerFormValues> = officer
    ? {
        name: officer.name,
        badgeNumber: officer.badgeNumber,
        rank: officer.rank,
        stationId: officer.stationId,
        email: "",
        phone: "",
      }
    : {
        name: "",
        badgeNumber: "",
        rank: "",
        stationId: "",
        email: "",
        phone: "",
      };

  const form = useForm<OfficerFormValues>({
    resolver: zodResolver(officerFormSchema),
    defaultValues,
  });

  async function onSubmit(values: OfficerFormValues) {
    setIsSubmitting(true);

    try {
      // Find selected station name
      const selectedStation = policeStations.find(
        (station) => station.id === values.stationId
      );

      const officerData: Officer = {
        id: officer?.id || generateId("OFF"),
        name: values.name,
        badgeNumber: values.badgeNumber,
        rank: values.rank,
        stationId: values.stationId,
        stationName: selectedStation?.name,
      };

      // Submit data
      if (isEditMode) {
        await apiRequest("PATCH", `/api/officers/${officer.id}`, officerData);
        toast({
          title: "Officer updated",
          description: `Successfully updated officer record for ${values.name}`,
        });
      } else {
        await apiRequest("POST", "/api/officers", officerData);
        toast({
          title: "Officer created",
          description: `Successfully added officer ${values.name}`,
        });
      }

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["/api/officers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/police-stations"] });
      onSuccess();
    } catch (error) {
      console.error("Error submitting officer data:", error);
      toast({
        title: "Error",
        description: `Failed to ${isEditMode ? "update" : "create"} officer. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Officer Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter full name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="badgeNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Badge Number</FormLabel>
                <FormControl>
                  <Input placeholder="Enter badge number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="rank"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rank</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select rank" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Constable">Constable</SelectItem>
                    <SelectItem value="Officer">Officer</SelectItem>
                    <SelectItem value="Sergeant">Sergeant</SelectItem>
                    <SelectItem value="Inspector">Inspector</SelectItem>
                    <SelectItem value="Chief Inspector">Chief Inspector</SelectItem>
                    <SelectItem value="Superintendent">Superintendent</SelectItem>
                    <SelectItem value="Chief Superintendent">Chief Superintendent</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="stationId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assigned Police Station</FormLabel>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Enter email (optional)" type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input placeholder="Enter phone number (optional)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onCancel} type="button">
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : isEditMode ? "Update Officer" : "Add Officer"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
