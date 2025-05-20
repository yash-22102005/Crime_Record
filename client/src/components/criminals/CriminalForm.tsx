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
import { Criminal } from "@/types";
import { generateId } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";

const criminalFormSchema = z.object({
  firstName: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  lastName: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }),
  age: z.coerce.number().int().min(8).max(120),
  gender: z.string(),
  status: z.enum(["active", "incarcerated", "released", "wanted"]),
  lastCrimeDate: z.string(),
  crimeType: z.string(),
  additionalCrimeTypes: z.string().optional(),
  photoUrl: z.string().optional(),
});

type CriminalFormValues = z.infer<typeof criminalFormSchema>;

interface CriminalFormProps {
  criminal?: Criminal;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CriminalForm({ criminal, onSuccess, onCancel }: CriminalFormProps) {
  const isEditMode = !!criminal;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Parse crimeTypes array into form values
  const defaultValues: Partial<CriminalFormValues> = criminal
    ? {
        firstName: criminal.firstName,
        lastName: criminal.lastName,
        age: criminal.age,
        gender: criminal.gender,
        status: criminal.status,
        lastCrimeDate: criminal.lastCrimeDate,
        crimeType: criminal.crimeTypes[0] || "",
        additionalCrimeTypes: criminal.crimeTypes.slice(1).join(", "),
        photoUrl: criminal.photoUrl,
      }
    : {
        firstName: "",
        lastName: "",
        age: 18,
        gender: "male",
        status: "active",
        lastCrimeDate: new Date().toISOString().split("T")[0],
        crimeType: "",
        additionalCrimeTypes: "",
        photoUrl: "",
      };

  const form = useForm<CriminalFormValues>({
    resolver: zodResolver(criminalFormSchema),
    defaultValues,
  });

  async function onSubmit(values: CriminalFormValues) {
    setIsSubmitting(true);

    try {
      // Prepare crimeTypes array
      const crimeTypes = [values.crimeType];
      if (values.additionalCrimeTypes) {
        const additionalTypes = values.additionalCrimeTypes
          .split(",")
          .map((type) => type.trim())
          .filter(Boolean);
        crimeTypes.push(...additionalTypes);
      }

      const criminalData: Criminal = {
        id: criminal?.id || generateId("CRIM"),
        firstName: values.firstName,
        lastName: values.lastName,
        age: values.age,
        gender: values.gender,
        status: values.status,
        lastCrimeDate: values.lastCrimeDate,
        crimeTypes,
        photoUrl: values.photoUrl,
      };

      // Submit data
      if (isEditMode) {
        await apiRequest("PATCH", `/api/criminals/${criminal.id}`, criminalData);
        toast({
          title: "Criminal record updated",
          description: `Successfully updated record for ${values.firstName} ${values.lastName}`,
        });
      } else {
        await apiRequest("POST", "/api/criminals", criminalData);
        toast({
          title: "Criminal record created",
          description: `Successfully added record for ${values.firstName} ${values.lastName}`,
        });
      }

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["/api/criminals"] });
      onSuccess();
    } catch (error) {
      console.error("Error submitting criminal data:", error);
      toast({
        title: "Error",
        description: `Failed to ${isEditMode ? "update" : "create"} criminal record. Please try again.`,
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
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter first name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter last name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="age"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Age</FormLabel>
                <FormControl>
                  <Input type="number" min={8} max={120} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gender</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
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
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="incarcerated">Incarcerated</SelectItem>
                    <SelectItem value="released">Released</SelectItem>
                    <SelectItem value="wanted">Wanted</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastCrimeDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Crime Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="crimeType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Primary Crime Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select crime type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Theft">Theft</SelectItem>
                  <SelectItem value="Burglary">Burglary</SelectItem>
                  <SelectItem value="Assault">Assault</SelectItem>
                  <SelectItem value="Fraud">Fraud</SelectItem>
                  <SelectItem value="Drug-related">Drug-related</SelectItem>
                  <SelectItem value="Vehicle Theft">Vehicle Theft</SelectItem>
                  <SelectItem value="Homicide">Homicide</SelectItem>
                  <SelectItem value="Cybercrime">Cybercrime</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="additionalCrimeTypes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Crime Types</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter additional crime types, separated by commas"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="photoUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Photo URL</FormLabel>
              <FormControl>
                <Input placeholder="Enter photo URL (optional)" {...field} />
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
            {isSubmitting ? "Saving..." : isEditMode ? "Update Criminal" : "Add Criminal"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
