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
import { PoliceStation } from "@/types";
import { generateId } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";

const stationFormSchema = z.object({
  name: z.string().min(3, {
    message: "Station name must be at least 3 characters.",
  }),
  address: z.string().min(5, {
    message: "Address must be at least 5 characters.",
  }),
  contact: z.string().min(5, {
    message: "Contact number must be at least 5 characters.",
  }),
  jurisdictionArea: z.string().optional(),
  additionalInfo: z.string().optional(),
});

type StationFormValues = z.infer<typeof stationFormSchema>;

interface StationFormProps {
  station?: PoliceStation;
  onSuccess: () => void;
  onCancel: () => void;
}

export function StationForm({ station, onSuccess, onCancel }: StationFormProps) {
  const isEditMode = !!station;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultValues: Partial<StationFormValues> = station
    ? {
        name: station.name,
        address: station.address,
        contact: station.contact,
        jurisdictionArea: "",
        additionalInfo: "",
      }
    : {
        name: "",
        address: "",
        contact: "",
        jurisdictionArea: "",
        additionalInfo: "",
      };

  const form = useForm<StationFormValues>({
    resolver: zodResolver(stationFormSchema),
    defaultValues,
  });

  async function onSubmit(values: StationFormValues) {
    setIsSubmitting(true);

    try {
      const stationData: PoliceStation = {
        id: station?.id || generateId("PS"),
        name: values.name,
        address: values.address,
        contact: values.contact,
        officerCount: station?.officerCount || 0,
      };

      // Submit data
      if (isEditMode) {
        await apiRequest("PATCH", `/api/police-stations/${station.id}`, stationData);
        toast({
          title: "Police station updated",
          description: `Successfully updated ${values.name}`,
        });
      } else {
        await apiRequest("POST", "/api/police-stations", stationData);
        toast({
          title: "Police station created",
          description: `Successfully added ${values.name}`,
        });
      }

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["/api/police-stations"] });
      onSuccess();
    } catch (error) {
      console.error("Error submitting police station data:", error);
      toast({
        title: "Error",
        description: `Failed to ${isEditMode ? "update" : "create"} police station. Please try again.`,
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
              <FormLabel>Station Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter station name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter station address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contact"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Number</FormLabel>
              <FormControl>
                <Input placeholder="Enter contact number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="jurisdictionArea"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Jurisdiction Area</FormLabel>
              <FormControl>
                <Input placeholder="Enter jurisdiction area (optional)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="additionalInfo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Information</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter any additional information (optional)" {...field} />
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
            {isSubmitting ? "Saving..." : isEditMode ? "Update Station" : "Add Station"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
