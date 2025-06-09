"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "convex/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Save,
  Upload,
  Loader2,
  User,
  Heart,
  MapPin,
  Shield,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useToast } from "@/hooks/use-toast";
import {
  patientProfileSchema,
  type PatientProfileFormData,
  bloodTypeOptions,
  genderOptions,
  languageOptions,
  emergencyContactRelationOptions,
  countryOptions,
  usStatesOptions
} from "@/lib/validations/patient";
import { api } from "@/convex/_generated/api";

export default function PatientProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/auth/login");
      return;
    }

    if (session.user.role !== "patient") {
      router.push("/auth/login");
      return;
    }
  }, [session, status, router]);

  // Queries
  const patientProfile = useQuery(api.patients.getPatientByUserId,
    session?.user?.id ? { userId: session.user.id as any } : "skip"
  );

  // Mutations
  const updateProfile = useMutation(api.patients.updatePatientProfile);
  const createProfile = useMutation(api.patients.createPatientProfile);

  // Form
  const form = useForm<PatientProfileFormData>({
    resolver: zodResolver(patientProfileSchema) as any,
    defaultValues: {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      gender: "M",
      primaryPhone: "",
      secondaryPhone: "",
      email: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      zipCode: "",
      country: "United States",
      nationalId: "",
      bloodType: undefined,
      emergencyContactName: "",
      emergencyContactPhone: "",
      emergencyContactRelation: "",
      preferredLanguage: "English",
      consentForTreatment: true,
      consentForDataSharing: false,
      advanceDirectives: "",
    },
  });

  // Load profile data when available
  useEffect(() => {
    if (patientProfile) {
      form.reset({
        firstName: patientProfile.firstName || "",
        lastName: patientProfile.lastName || "",
        dateOfBirth: patientProfile.dateOfBirth || "",
        gender: patientProfile.gender || "M",
        primaryPhone: patientProfile.primaryPhone || "",
        secondaryPhone: patientProfile.secondaryPhone || "",
        email: patientProfile.email || "",
        addressLine1: patientProfile.addressLine1 || "",
        addressLine2: patientProfile.addressLine2 || "",
        city: patientProfile.city || "",
        state: patientProfile.state || "",
        zipCode: patientProfile.zipCode || "",
        country: patientProfile.country || "United States",
        nationalId: patientProfile.nationalId || "",
        bloodType: patientProfile.bloodType || undefined,
        emergencyContactName: patientProfile.emergencyContactName || "",
        emergencyContactPhone: patientProfile.emergencyContactPhone || "",
        emergencyContactRelation: patientProfile.emergencyContactRelation || "",
        preferredLanguage: patientProfile.preferredLanguage || "English",
        consentForTreatment: patientProfile.consentForTreatment ?? true,
        consentForDataSharing: patientProfile.consentForDataSharing ?? false,
        advanceDirectives: patientProfile.advanceDirectives || "",
      });
    }
  }, [patientProfile, form]);

  const onSubmit = async (data: PatientProfileFormData) => {
    setIsLoading(true);
    try {
      if (patientProfile) {
        await updateProfile({
          patientId: patientProfile._id,
          lastModifiedBy: session!.user.id as any,
          ...data,
        });
        toast({
          title: "Profile updated successfully!",
          description: "Your profile information has been saved.",
        });
      } else {
        // Create new profile
        await createProfile({
          userId: session!.user.id as any,
          firstName: data.firstName,
          lastName: data.lastName,
          dateOfBirth: data.dateOfBirth,
          gender: data.gender,
          primaryPhone: data.primaryPhone,
          email: data.email,
          addressLine1: data.addressLine1,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          country: data.country,
          emergencyContactName: data.emergencyContactName,
          emergencyContactPhone: data.emergencyContactPhone,
          emergencyContactRelation: data.emergencyContactRelation,
          consentForTreatment: data.consentForTreatment,
          consentForDataSharing: data.consentForDataSharing,
          // Optional fields
          secondaryPhone: data.secondaryPhone,
          addressLine2: data.addressLine2,
          nationalId: data.nationalId,
          bloodType: data.bloodType,
          preferredLanguage: data.preferredLanguage,
          advanceDirectives: data.advanceDirectives,
        });
        toast({
          title: "Profile created successfully!",
          description: "Your profile has been created.",
        });
      }
    } catch (error) {
      toast({
        title: "Error updating profile",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session || session.user.role !== "patient") {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="h-full flex flex-col space-y-4">
        {/* Header */}
        <div className="flex-shrink-0">
          <div className="flex items-center gap-4">
            <Link href="/patient/settings">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Settings
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-xl font-bold tracking-tight">Profile Settings</h1>
              <p className="text-muted-foreground text-sm">
                Manage your personal information and medical details
              </p>
            </div>
            {patientProfile && (
              <Badge variant="outline" className="flex items-center gap-2">
                <Shield className="h-3 w-3" />
                MRN: {patientProfile.mrn}
              </Badge>
            )}
          </div>
        </div>

        {/* Profile Overview */}
        <div className="flex-shrink-0">
          <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg border">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="text-sm">
                {patientProfile ?
                  `${patientProfile.firstName?.[0] || ""}${patientProfile.lastName?.[0] || ""}` :
                  session.user.email?.charAt(0).toUpperCase() || "U"
                }
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="font-semibold">
                {patientProfile ? `${patientProfile.firstName} ${patientProfile.lastName}` : "Complete Your Profile"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {patientProfile ?
                  `Patient since ${new Date(patientProfile.createdAt).toLocaleDateString()}` :
                  "Set up your patient profile to get started"
                }
              </p>
            </div>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload Photo
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-h-0 flex">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-full h-full flex flex-col">
              {/* Tab Navigation */}
              <div className="flex-shrink-0 mb-4">
                <Tabs defaultValue="personal" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="personal" className="flex items-center gap-2">
                      <User className="h-3 w-3" />
                      Personal
                    </TabsTrigger>
                    <TabsTrigger value="address" className="flex items-center gap-2">
                      <MapPin className="h-3 w-3" />
                      Address
                    </TabsTrigger>
                    <TabsTrigger value="medical" className="flex items-center gap-2">
                      <Heart className="h-3 w-3" />
                      Medical
                    </TabsTrigger>
                    <TabsTrigger value="emergency" className="flex items-center gap-2">
                      <Shield className="h-3 w-3" />
                      Emergency
                    </TabsTrigger>
                  </TabsList>

                  {/* Tab Content - Scrollable */}
                  <div className="flex-1 min-h-0">
                    <ScrollArea className="h-full scrollbar-hide">
                      <div className="space-y-4">
                        <TabsContent value="personal" className="space-y-4 mt-0">
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
                              name="dateOfBirth"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Date of Birth</FormLabel>
                                  <FormControl>
                                    <Input type="date" {...field} />
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
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select gender" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {genderOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                          {option.label}
                                        </SelectItem>
                                      ))}
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
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Email Address</FormLabel>
                                  <FormControl>
                                    <Input type="email" placeholder="Enter email address" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="primaryPhone"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Primary Phone</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter primary phone number" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="secondaryPhone"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Secondary Phone (Optional)</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter secondary phone number" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="preferredLanguage"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Preferred Language</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select language" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {languageOptions.map((language) => (
                                        <SelectItem key={language} value={language}>
                                          {language}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name="nationalId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>National ID (Optional)</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter national ID number" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TabsContent>

                        <TabsContent value="address" className="space-y-4 mt-0">
                          <FormField
                            control={form.control}
                            name="addressLine1"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Address Line 1</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter street address" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="addressLine2"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Address Line 2 (Optional)</FormLabel>
                                <FormControl>
                                  <Input placeholder="Apartment, suite, etc." {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                              control={form.control}
                              name="city"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>City</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter city" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="state"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>State</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select state" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {usStatesOptions.map((state) => (
                                        <SelectItem key={state} value={state}>
                                          {state}
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
                              name="zipCode"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>ZIP Code</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter ZIP code" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <FormField
                            control={form.control}
                            name="country"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Country</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select country" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {countryOptions.map((country) => (
                                      <SelectItem key={country} value={country}>
                                        {country}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TabsContent>

                        <TabsContent value="medical" className="space-y-4 mt-0">
                          <FormField
                            control={form.control}
                            name="bloodType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Blood Type</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select blood type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {bloodTypeOptions.map((type) => (
                                      <SelectItem key={type} value={type}>
                                        {type}
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
                            name="advanceDirectives"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Advance Directives (Optional)</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Enter any advance directives or special medical instructions..."
                                    className="min-h-[100px]"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="space-y-4">
                            <div className="border-t pt-4">
                              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                                <Shield className="h-4 w-4" />
                                Consent & Privacy
                              </h4>
                              <div className="space-y-3">
                                <FormField
                                  control={form.control}
                                  name="consentForTreatment"
                                  render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value}
                                          onCheckedChange={field.onChange}
                                        />
                                      </FormControl>
                                      <div className="space-y-1 leading-none">
                                        <FormLabel className="text-sm font-normal">
                                          Consent for Treatment
                                        </FormLabel>
                                        <p className="text-xs text-muted-foreground">
                                          I consent to receive medical treatment and care from healthcare providers.
                                        </p>
                                      </div>
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="consentForDataSharing"
                                  render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value}
                                          onCheckedChange={field.onChange}
                                        />
                                      </FormControl>
                                      <div className="space-y-1 leading-none">
                                        <FormLabel className="text-sm font-normal">
                                          Consent for Data Sharing
                                        </FormLabel>
                                        <p className="text-xs text-muted-foreground">
                                          I consent to sharing my medical data with other healthcare providers for treatment purposes.
                                        </p>
                                      </div>
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="emergency" className="space-y-4 mt-0">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="emergencyContactName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Emergency Contact Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter emergency contact name" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="emergencyContactPhone"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Emergency Contact Phone</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter emergency contact phone" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <FormField
                            control={form.control}
                            name="emergencyContactRelation"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Relationship</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select relationship" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {emergencyContactRelationOptions.map((relation) => (
                                      <SelectItem key={relation} value={relation}>
                                        {relation}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TabsContent>
                      </div>
                    </ScrollArea>
                  </div>

                  {/* Submit Button */}
                  <div className="flex-shrink-0 pt-4 border-t">
                    <div className="flex justify-end">
                      <Button type="submit" disabled={isLoading} className="flex items-center gap-2">
                        {isLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            Save Profile
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </Tabs>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </DashboardLayout>
  );
}
