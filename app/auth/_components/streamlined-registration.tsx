"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import bcrypt from "bcryptjs";
import { useToast } from "@/hooks/use-toast";


import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@/components/ui/input-otp";


import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, User, Mail, Building, ArrowLeft, Stethoscope, Heart, Pill, Link2 } from "lucide-react";
import Link from "next/link";

type UserRole = "doctor" | "patient" | "pharmacy";

interface StreamlinedRegistrationProps {
  role: UserRole; // Make role required since it comes from role selection
}

// Step 1: Account Creation (Combined personal info + security)
const step1Schema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address").toLowerCase(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Step 2: Role-Specific Essentials (Simplified)
const step2PatientSchema = z.object({
  phone: z.string().min(10, "Phone number is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["M", "F", "O"], { required_error: "Please select a gender" }),
});

const step2DoctorSchema = z.object({
  phone: z.string().min(10, "Phone number is required"),
  licenseNumber: z.string().min(1, "Medical license number is required"),
  primarySpecialty: z.string().min(1, "Primary specialty is required"),
});

const step2PharmacySchema = z.object({
  organizationName: z.string().min(1, "Organization name is required"),
  phone: z.string().min(10, "Phone number is required"),
  licenseNumber: z.string().min(1, "Pharmacy license number is required"),
});

// Step 3: Email OTP Verification (Conditional)
const step3OtpSchema = z.object({
  otp: z.string().min(6, "OTP must be 6 digits").max(6, "OTP must be 6 digits"),
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2PatientData = z.infer<typeof step2PatientSchema>;
type Step2DoctorData = z.infer<typeof step2DoctorSchema>;
type Step2PharmacyData = z.infer<typeof step2PharmacySchema>;
type Step3OtpData = z.infer<typeof step3OtpSchema>;

export function StreamlinedRegistration({ role }: StreamlinedRegistrationProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const registrationMethod = 'manual'; // Always manual for now
  const [selectedRole] = useState<UserRole>(role); // Role is fixed from previous selection
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [otpLoading, setOtpLoading] = useState(false);

  const createUser = useMutation(api.users.createUser);
  const createDoctorProfile = useMutation(api.doctors.createOrUpdateDoctorProfile);
  const createPatientProfile = useMutation(api.patients.createPatientProfile);
  const createPharmacyProfile = useMutation(api.pharmacies.createPharmacy);



  const getRoleIcon = (userRole: UserRole) => {
    switch (userRole) {
      case "patient": return Heart;
      case "doctor": return Stethoscope;
      case "pharmacy": return Pill;
      default: return User;
    }
  };

  const getRoleDescription = (userRole: UserRole) => {
    switch (userRole) {
      case "patient": return "Join thousands of patients managing their health with MedScribe";
      case "doctor": return "Connect with patients and streamline your practice with MedScribe";
      case "pharmacy": return "Manage prescriptions and connect with healthcare providers";
      default: return "Welcome to MedScribe";
    }
  };

  const getRoleStepTitle = (userRole: UserRole) => {
    switch (userRole) {
      case "patient": return "Patient Details";
      case "doctor": return "Professional Info";
      case "pharmacy": return "Pharmacy Details";
      default: return "Details";
    }
  };

  const getStepsForRole = (userRole: UserRole, regMethod: 'manual' | 'google') => {
    const baseSteps = [
      { number: 1, title: "Account Setup", icon: User, completed: currentStep > 1 },
      { number: 2, title: getRoleStepTitle(userRole), icon: Building, completed: currentStep > 2 },
    ];

    if (regMethod === 'manual') {
      baseSteps.push(
        { number: 3, title: "Email Verification", icon: Mail, completed: currentStep > 3 }
      );
    }

    return baseSteps;
  };

  const steps = getStepsForRole(selectedRole, registrationMethod);

  // Clean up any leftover OAuth data
  useEffect(() => {
    // Clean up any leftover OAuth-related localStorage items
    localStorage.removeItem("registrationFlow");
    localStorage.removeItem("oauthData");
  }, []);

  // OTP countdown effect
  useEffect(() => {
    if (otpCountdown > 0) {
      const timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpCountdown]);

  // Handle Google OAuth - simplified approach
  const handleGoogleSignup = async () => {
    try {
      setIsLoading(true);

      // For now, show a message that Google OAuth will be implemented
      toast({
        title: "Google OAuth",
        description: "Google OAuth registration will be available soon. Please use manual registration for now.",
      });

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign up with Google",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Send OTP
  const handleSendOtp = async (email: string, firstName: string = "User") => {
    try {
      setOtpLoading(true);

      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, firstName }),
      });

      const data = await response.json();

      if (response.ok) {
        setOtpCountdown(600); // 10 minutes
        toast({
          title: "Verification Code Sent",
          description: "Please check your email for the 6-digit verification code.",
        });
      } else {
        throw new Error(data.error || "Failed to send OTP");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send verification code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setOtpLoading(false);
    }
  };

  // Step 1 Form (Account Creation)
  const step1Form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Step 2 Forms (Role-specific essentials)
  const step2PatientForm = useForm<Step2PatientData>({
    resolver: zodResolver(step2PatientSchema),
    defaultValues: {
      phone: "",
      dateOfBirth: "",
      gender: "M",
    },
  });

  const step2DoctorForm = useForm<Step2DoctorData>({
    resolver: zodResolver(step2DoctorSchema),
    defaultValues: {
      phone: "",
      licenseNumber: "",
      primarySpecialty: "",
    },
  });

  const step2PharmacyForm = useForm<Step2PharmacyData>({
    resolver: zodResolver(step2PharmacySchema),
    defaultValues: {
      organizationName: "",
      phone: "",
      licenseNumber: "",
    },
  });

  // Step 3 OTP Form (Conditional)
  const step3OtpForm = useForm<Step3OtpData>({
    resolver: zodResolver(step3OtpSchema),
    defaultValues: {
      otp: "",
    },
  });

  // Step handlers
  const onStep1Submit = async (data: Step1Data) => {
    try {
      setIsLoading(true);
      setFormData(prev => ({ ...prev, ...data, role: selectedRole })); // Include role from props
      setCurrentStep(2);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to proceed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onStep2Submit = async (data: Step2PatientData | Step2DoctorData | Step2PharmacyData) => {
    try {
      setIsLoading(true);
      const updatedFormData = { ...formData, ...data };
      setFormData(updatedFormData);

      // Send OTP for manual registration
      await handleSendOtp(formData.email, formData.firstName);
      setCurrentStep(3);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to proceed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onStep3Submit = async (data: Step3OtpData) => {
    try {
      setIsLoading(true);

      // Verify OTP
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          otp: data.otp
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Email Verified!",
          description: "Your email has been successfully verified.",
        });
        await handleFinalSubmit({ ...formData, ...data });
      } else {
        toast({
          title: "Verification Failed",
          description: result.error || "Invalid verification code. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to verify code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalSubmit = async (finalData: any) => {
    try {
      setIsLoading(true);

      // Create regular user with hashed password
      const passwordHash = await bcrypt.hash(finalData.password, 12);
      const userId = await createUser({
        email: finalData.email,
        passwordHash,
        role: finalData.role,
      });

      // Create role-specific profile
      await createRoleProfile(userId, finalData);

      toast({
        title: "Account Created!",
        description: "Welcome to MedScribe. Redirecting to your dashboard...",
      });

      // Clear localStorage
      localStorage.removeItem("selectedRole");

      // Redirect based on role
      setTimeout(() => {
        router.push(`/${finalData.role}`);
      }, 2000);

    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to create account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createRoleProfile = async (userId: string, data: any) => {
    switch (data.role) {
      case "doctor":
        await createDoctorProfile({
          userId: userId as any,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          licenseNumber: data.licenseNumber,
          primarySpecialty: data.primarySpecialty,
        });
        break;

      case "patient":
        await createPatientProfile({
          userId: userId as any,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          primaryPhone: data.phone,
          dateOfBirth: data.dateOfBirth,
          gender: data.gender,
          // Required fields with defaults for now
          addressLine1: "To be updated",
          city: "To be updated",
          state: "To be updated",
          zipCode: "00000",
          country: "USA",
          emergencyContactName: "To be updated",
          emergencyContactPhone: "To be updated",
          emergencyContactRelation: "To be updated",
        });
        break;

      case "pharmacy":
        await createPharmacyProfile({
          userId: userId as any,
          name: data.organizationName,
          licenseNumber: data.licenseNumber,
          phone: data.phone,
          email: data.email,
          ncpdpId: `TEMP_${Date.now()}`, // Temporary, to be updated
          address: {
            street: "To be updated",
            city: "To be updated",
            state: "To be updated",
            zipCode: "00000",
          },
          isActive: true,
          isVerified: false,
        });
        break;
    }
  };

  // Render Step 1: Account Creation
  const renderStep1 = () => (
    <Form {...step1Form}>
      <form onSubmit={step1Form.handleSubmit(onStep1Submit)} className="space-y-6">
        {/* Google OAuth Section */}
        <div className="space-y-4">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignup}
            disabled={isLoading}
          >
            <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>
        </div>

        {/* Manual Registration Form */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={step1Form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="John" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={step1Form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={step1Form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="john@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />



        <FormField
          control={step1Form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={step1Form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Creating Account..." : "Continue"}
        </Button>
      </form>
    </Form>
  );

  // Render Step 2: Role-Specific Essentials
  const renderStep2 = () => {
    switch (selectedRole) {
      case "patient":
        return (
          <Form {...step2PatientForm}>
            <form onSubmit={step2PatientForm.handleSubmit(onStep2Submit)} className="space-y-6">
              <FormField
                control={step2PatientForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="(555) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={step2PatientForm.control}
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
                control={step2PatientForm.control}
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
                        <SelectItem value="M">Male</SelectItem>
                        <SelectItem value="F">Female</SelectItem>
                        <SelectItem value="O">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={() => setCurrentStep(1)} className="flex-1">
                  Back
                </Button>
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? "Processing..." : "Continue"}
                </Button>
              </div>
            </form>
          </Form>
        );

      case "doctor":
        return (
          <Form {...step2DoctorForm}>
            <form onSubmit={step2DoctorForm.handleSubmit(onStep2Submit)} className="space-y-6">
              <FormField
                control={step2DoctorForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="(555) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={step2DoctorForm.control}
                name="licenseNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medical License Number</FormLabel>
                    <FormControl>
                      <Input placeholder="MD123456" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={step2DoctorForm.control}
                name="primarySpecialty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Specialty</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select specialty" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="family-medicine">Family Medicine</SelectItem>
                        <SelectItem value="internal-medicine">Internal Medicine</SelectItem>
                        <SelectItem value="pediatrics">Pediatrics</SelectItem>
                        <SelectItem value="cardiology">Cardiology</SelectItem>
                        <SelectItem value="dermatology">Dermatology</SelectItem>
                        <SelectItem value="orthopedics">Orthopedics</SelectItem>
                        <SelectItem value="psychiatry">Psychiatry</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={() => setCurrentStep(1)} className="flex-1">
                  Back
                </Button>
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? "Processing..." : "Continue"}
                </Button>
              </div>
            </form>
          </Form>
        );

      case "pharmacy":
        return (
          <Form {...step2PharmacyForm}>
            <form onSubmit={step2PharmacyForm.handleSubmit(onStep2Submit)} className="space-y-6">
              <FormField
                control={step2PharmacyForm.control}
                name="organizationName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pharmacy Name</FormLabel>
                    <FormControl>
                      <Input placeholder="ABC Pharmacy" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={step2PharmacyForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="(555) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={step2PharmacyForm.control}
                name="licenseNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pharmacy License Number</FormLabel>
                    <FormControl>
                      <Input placeholder="PH123456" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={() => setCurrentStep(1)} className="flex-1">
                  Back
                </Button>
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? "Processing..." : "Continue"}
                </Button>
              </div>
            </form>
          </Form>
        );

      default:
        return null;
    }
  };

  // Render Step 3: Email Verification (Conditional)
  const renderStep3 = () => (
    <Form {...step3OtpForm}>
      <form onSubmit={step3OtpForm.handleSubmit(onStep3Submit)} className="space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">Verify Your Email</h3>
          <p className="text-sm text-muted-foreground">
            We've sent a 6-digit code to <strong>{formData.email}</strong>
          </p>
        </div>

        <FormField
          control={step3OtpForm.control}
          name="otp"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-center block">Verification Code</FormLabel>
              <FormControl>
                <div className="flex justify-center">
                  <InputOTP maxLength={6} {...field}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="text-center">
          {otpCountdown > 0 ? (
            <p className="text-sm text-muted-foreground">
              Resend code in {Math.floor(otpCountdown / 60)}:{(otpCountdown % 60).toString().padStart(2, '0')}
            </p>
          ) : (
            <Button
              type="button"
              variant="link"
              onClick={() => handleSendOtp(formData.email, formData.firstName)}
              disabled={otpLoading}
              className="text-sm"
            >
              {otpLoading ? "Sending..." : "Resend code"}
            </Button>
          )}
        </div>

        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={() => setCurrentStep(2)} className="flex-1">
            Back
          </Button>
          <Button type="submit" className="flex-1" disabled={isLoading || step3OtpForm.watch("otp").length !== 6}>
            {isLoading ? "Verifying..." : "Complete Registration"}
          </Button>
        </div>
      </form>
    </Form>
  );

  // Main component render
  return (
    <div className="w-full max-w-md">
      {/* Back to Role Selection */}
      <div className="mb-6">
        <Link
          href="/auth/select-role"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to role selection
        </Link>
      </div>

      {/* Header with Logo and Role */}
      <div className="text-center space-y-4 pb-8">
        {/* Logo and Role Icon Connection */}
        <div className="flex items-center justify-center space-x-4">
          {/* MedScribe Logo */}
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 ring-1 ring-primary/20">
            <div className="text-2xl font-bold text-primary">M</div>
          </div>

          {/* Connection Link Icon */}
          <Link2 className="h-8 w-8 text-primary" />

          {/* Role Icon */}
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 ring-1 ring-primary/20">
            {(() => {
              const RoleIcon = getRoleIcon(selectedRole);
              return <RoleIcon className="h-8 w-8 text-primary" />;
            })()}
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Create Your Account</h1>
          <p className="text-muted-foreground max-w-sm mx-auto">
            {getRoleDescription(selectedRole)}
          </p>
        </div>
      </div>



      {/* Step Indicators */}
      <div className="flex justify-center space-x-4 mb-8">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div key={step.number} className="flex flex-col items-center space-y-2">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                step.completed
                  ? "bg-primary border-primary text-primary-foreground"
                  : currentStep === step.number
                  ? "border-primary text-primary"
                  : "border-muted-foreground/30 text-muted-foreground"
              }`}>
                {step.completed ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
              </div>
              <span className={`text-xs font-medium ${
                step.completed || currentStep === step.number
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}>
                {step.title}
              </span>
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <div className="space-y-6">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && registrationMethod === 'manual' && renderStep3()}

        {/* Login Link */}
        <div className="pt-6 border-t border-border text-center">
          <Link
            href="/auth/login"
            className="text-sm text-primary hover:text-primary/80 transition-colors"
          >
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}