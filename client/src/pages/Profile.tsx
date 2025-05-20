import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Profile as ProfileType } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Shield, Mail, Phone, Home } from "lucide-react";

const profileFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  phoneNumber: z.string().min(5, { message: "Phone number must be at least 5 characters" }),
  address: z.string().min(5, { message: "Address must be at least 5 characters" }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const { data: profile, isLoading } = useQuery<ProfileType>({
    queryKey: ["/api/profile"],
    enabled: !!user,
  });

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      email: profile?.email || "",
      phoneNumber: profile?.phoneNumber || "",
      address: profile?.address || "",
    },
    values: {
      email: profile?.email || "",
      phoneNumber: profile?.phoneNumber || "",
      address: profile?.address || "",
    },
  });

  async function onSubmit(values: ProfileFormValues) {
    if (!user) return;

    setIsUpdating(true);
    try {
      await apiRequest("PATCH", "/api/profile", {
        ...values,
        userId: user.id,
      });

      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">My Profile</h2>
        <p className="mt-1 text-sm text-gray-600">
          Manage your account settings and profile information.
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="account">Account Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal profile information here.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="" alt={user?.username} />
                  <AvatarFallback>{user?.username?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium text-lg">{user?.username}</h3>
                  <div className="flex items-center mt-1">
                    <Shield className="h-4 w-4 text-primary mr-1" />
                    <Badge className="capitalize">{user?.role}</Badge>
                  </div>
                </div>
              </div>

              <Separator />

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <FormControl>
                            <Input placeholder="your.email@example.com" {...field} />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <FormControl>
                            <Input placeholder="Your phone number" {...field} />
                          </FormControl>
                        </div>
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
                        <div className="flex items-center space-x-2">
                          <Home className="h-4 w-4 text-muted-foreground" />
                          <FormControl>
                            <Input placeholder="Your address" {...field} />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={isUpdating}>
                    {isUpdating ? "Updating..." : "Update Profile"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Manage your account settings and preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">Account Information</h3>
                <p className="text-sm text-muted-foreground">
                  Username: <span className="font-medium">{user?.username}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Role: <span className="font-medium capitalize">{user?.role}</span>
                </p>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h3 className="font-medium">Password Management</h3>
                <p className="text-sm text-muted-foreground">
                  For security reasons, please contact an administrator to reset your password.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Request Password Reset
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
