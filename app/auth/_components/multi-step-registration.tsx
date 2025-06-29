"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "convex/react";
import bcrypt from "bcryptjs";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/convex/_generated/api";
import { UserRole } from "@/lib/validations/auth";
import { CheckCircle, Circle, User, Mail, Lock, Building } from "lucide-react";

// Step schemas
const step1Schema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address").toLowerCase(),
});

const step2Schema = z.object({
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

// Step 3: Email OTP Verification
const step3OtpSchema = z.object({
  otp: z.string().min(6, "OTP must be 6 digits").max(6, "OTP must be 6 digits"),
});

// Patient-specific step 3
const step3PatientSchema = z.object({
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["M", "F", "O"], { required_error: "Please select a gender" }),
  phone: z.string().min(10, "Phone number is required"),
  address: z.object({
    street: z.string().min(1, "Street address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(2, "State is required"),
    zipCode: z.string().min(5, "ZIP code is required"),
  }),
  emergencyContact: z.object({
    name: z.string().min(1, "Emergency contact name is required"),
    phone: z.string().min(10, "Emergency contact phone is required"),
    relation: z.string().min(1, "Relationship is required"),
  }),
});

// Doctor-specific step 3
const step3DoctorSchema = z.object({
  phone: z.string().min(10, "Phone number is required"),
  licenseNumber: z.string().min(1, "Medical license number is required"),
  primarySpecialty: z.string().min(1, "Primary specialty is required"),
  deaNumber: z.string().optional(),
  npiNumber: z.string().optional(),
  address: z.object({
    street: z.string().min(1, "Practice address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(2, "State is required"),
    zipCode: z.string().min(5, "ZIP code is required"),
  }),
});

// Pharmacy-specific step 3
const step3PharmacySchema = z.object({
  organizationName: z.string().min(2, "Pharmacy name is required"),
  licenseNumber: z.string().min(1, "Pharmacy license number is required"),
  phone: z.string().min(10, "Phone number is required"),
  deaNumber: z.string().optional(),
  npiNumber: z.string().optional(),
  address: z.object({
    street: z.string().min(1, "Pharmacy address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(2, "State is required"),
    zipCode: z.string().min(5, "ZIP code is required"),
  }),
  pharmacistInCharge: z.string().optional(),
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;
type Step3OtpData = z.infer<typeof step3OtpSchema>;
type Step4PatientData = z.infer<typeof step3PatientSchema>;
type Step4DoctorData = z.infer<typeof step3DoctorSchema>;
type Step4PharmacyData = z.infer<typeof step3PharmacySchema>;

interface MultiStepRegistrationProps {
  role: UserRole;
}

export function MultiStepRegistration({ role }: MultiStepRegistrationProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<any>({});

  const createUser = useMutation(api.users.createUser);

  const totalSteps = 4; // All roles now have 4 steps: Personal Info, Security, Email Verification, Role-specific Info
  const progress = (currentStep / totalSteps) * 100;

  // OTP state
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [canResendOtp, setCanResendOtp] = useState(false);

  const getStepsForRole = (userRole: UserRole) => {
    const baseSteps = [
      { number: 1, title: "Personal Info", icon: User, completed: currentStep > 1 },
      { number: 2, title: "Security", icon: Lock, completed: currentStep > 2 },
      { number: 3, title: "Email Verification", icon: Mail, completed: currentStep > 3 },
    ];

    switch (userRole) {
      case "patient":
        return [...baseSteps, { number: 4, title: "Details & Emergency", icon: User, completed: currentStep > 4 }];
      case "doctor":
        return [...baseSteps, { number: 4, title: "Professional Info", icon: Building, completed: currentStep > 4 }];
      case "pharmacy":
        return [...baseSteps, { number: 4, title: "Pharmacy Details", icon: Building, completed: currentStep > 4 }];
      default:
        return baseSteps;
    }
  };

  const steps = getStepsForRole(role);

  // OTP countdown effect
  useEffect(() => {
    if (otpCountdown > 0) {
      const timer = setTimeout(() => {
        const newCountdown = otpCountdown - 1;
        setOtpCountdown(newCountdown);

        // Enable resend button after 2 minutes (480 seconds remaining out of 600)
        if (newCountdown === 480) {
          setCanResendOtp(true);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [otpCountdown]);

  // Resend OTP function
  const resendOtp = async () => {
    try {
      setOtpLoading(true);
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          firstName: formData.firstName,
        }),
      });

      if (response.ok) {
        setOtpCountdown(600); // Reset to 10 minutes
        setCanResendOtp(false); // Disable resend button for another 2 minutes
        toast({
          title: "Verification code resent!",
          description: "Please check your email for the new verification code.",
        });
      } else {
        const error = await response.json();
        toast({
          title: "Failed to resend code",
          description: error.error || "Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resend verification code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setOtpLoading(false);
    }
  };

  // Step 1 Form
  const step1Form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      firstName: formData.firstName || "",
      lastName: formData.lastName || "",
      email: formData.email || "",
    },
  });

  // Step 2 Form
  const step2Form = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // Step 3 OTP Form
  const step3OtpForm = useForm<Step3OtpData>({
    resolver: zodResolver(step3OtpSchema),
    defaultValues: {
      otp: "",
    },
  });

  // Step 4 Forms (role-specific)
  const step4PatientForm = useForm<Step4PatientData>({
    resolver: zodResolver(step3PatientSchema),
    defaultValues: {
      dateOfBirth: formData.dateOfBirth || "",
      gender: formData.gender || "M",
      phone: formData.phone || "",
      address: {
        street: formData.address?.street || "",
        city: formData.address?.city || "",
        state: formData.address?.state || "",
        zipCode: formData.address?.zipCode || "",
      },
      emergencyContact: {
        name: formData.emergencyContact?.name || "",
        phone: formData.emergencyContact?.phone || "",
        relation: formData.emergencyContact?.relation || "",
      },
    },
  });

  const step4DoctorForm = useForm<Step4DoctorData>({
    resolver: zodResolver(step3DoctorSchema),
    defaultValues: {
      phone: formData.phone || "",
      licenseNumber: formData.licenseNumber || "",
      primarySpecialty: formData.primarySpecialty || "",
      deaNumber: formData.deaNumber || "",
      npiNumber: formData.npiNumber || "",
      address: {
        street: formData.address?.street || "",
        city: formData.address?.city || "",
        state: formData.address?.state || "",
        zipCode: formData.address?.zipCode || "",
      },
    },
  });

  const step4PharmacyForm = useForm<Step4PharmacyData>({
    resolver: zodResolver(step3PharmacySchema),
    defaultValues: {
      organizationName: formData.organizationName || "",
      licenseNumber: formData.licenseNumber || "",
      phone: formData.phone || "",
      deaNumber: formData.deaNumber || "",
      npiNumber: formData.npiNumber || "",
      address: {
        street: formData.address?.street || "",
        city: formData.address?.city || "",
        state: formData.address?.state || "",
        zipCode: formData.address?.zipCode || "",
      },
      pharmacistInCharge: formData.pharmacistInCharge || "",
    },
  });

  const onStep1Submit = (data: Step1Data) => {
    setFormData(prev => ({ ...prev, ...data }));
    setCurrentStep(2);
  };

  const onStep2Submit = async (data: Step2Data) => {
    setFormData(prev => ({ ...prev, ...data }));

    // Send OTP email
    try {
      setOtpLoading(true);
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          firstName: formData.firstName,
        }),
      });

      if (response.ok) {
        setIsOtpSent(true);
        setOtpCountdown(600); // 10 minutes
        setCanResendOtp(false); // Disable resend for first 2 minutes
        setCurrentStep(3);

        toast({
          title: "Verification code sent!",
          description: "Please check your email for the 6-digit verification code.",
        });
      } else {
        const error = await response.json();
        toast({
          title: "Failed to send verification code",
          description: error.error || "Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send verification code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setOtpLoading(false);
    }
  };

  const onStep3OtpSubmit = async (data: Step3OtpData) => {
    try {
      setOtpLoading(true);
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          otp: data.otp,
        }),
      });

      if (response.ok) {
        setFormData(prev => ({ ...prev, ...data }));
        setCurrentStep(4);

        toast({
          title: "Email verified!",
          description: "Please complete your profile information.",
        });
      } else {
        const error = await response.json();
        toast({
          title: "Invalid verification code",
          description: error.error || "Please check your code and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setOtpLoading(false);
    }
  };

  const onStep4Submit = (data: any) => {
    const finalData = { ...formData, ...data };
    setFormData(finalData);
    handleFinalSubmit(finalData);
  };

  const handleFinalSubmit = async (data: any) => {
    setIsLoading(true);

    try {
      // Hash the password
      const passwordHash = await bcrypt.hash(data.password, 12);

      // Create user in Convex
      const userId = await createUser({
        email: data.email,
        passwordHash,
        role: role,
      });

      // Profiles are now complete after comprehensive registration

      // Handle role-specific profile creation with comprehensive data
      if (role === "patient") {
        await fetch("/api/patient/create-profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            dateOfBirth: data.dateOfBirth,
            gender: data.gender,
            primaryPhone: data.phone,
            addressLine1: data.address.street,
            city: data.address.city,
            state: data.address.state,
            zipCode: data.address.zipCode,
            country: "USA",
            emergencyContactName: data.emergencyContact.name,
            emergencyContactPhone: data.emergencyContact.phone,
            emergencyContactRelation: data.emergencyContact.relation,
            consentForTreatment: true,
            consentForDataSharing: false,
          }),
        });
      } else if (role === "doctor") {
        // Create doctor profile with comprehensive data
        await fetch("/api/doctor/create-profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            licenseNumber: data.licenseNumber,
            npiNumber: data.npiNumber,
            deaNumber: data.deaNumber,
            primarySpecialty: data.primarySpecialty,
            // Practice address
            practiceAddress: data.address,
          }),
        });
      } else if (role === "pharmacy") {
        await fetch("/api/pharmacy/create-profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            name: data.organizationName,
            licenseNumber: data.licenseNumber,
            phone: data.phone,
            email: data.email,
            deaNumber: data.deaNumber,
            npiNumber: data.npiNumber,
            pharmacistInCharge: data.pharmacistInCharge,
            ncpdpId: `TEMP_${Date.now()}`, // Will be updated during verification
            address: data.address,
            isActive: true,
            isVerified: false,
          }),
        });
      }

      // Send welcome email
      try {
        await fetch("/api/auth/send-welcome-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: data.email,
            firstName: data.firstName,
            role: role,
          }),
        });
      } catch (emailError) {
        console.error("Failed to send welcome email:", emailError);
      }

      toast({
        title: "Account created successfully!",
        description: "Please check your email for verification instructions.",
      });

      // Clear the stored role
      localStorage.removeItem("selectedRole");

      // Redirect to login
      router.push("/auth/login");
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <div className="text-center">
            <CardTitle className="text-2xl">Create Your Account</CardTitle>
            <CardDescription>
              Step {currentStep} of {totalSteps} - {role === "pharmacy" ? "Pharmacy" : role === "doctor" ? "Doctor" : "Patient"} Registration
            </CardDescription>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>

          {/* Step Indicators */}
          <div className="flex justify-center space-x-4">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.number} className="flex flex-col items-center space-y-1">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    step.completed 
                      ? "bg-primary border-primary text-primary-foreground" 
                      : currentStep === step.number
                      ? "border-primary text-primary"
                      : "border-muted-foreground text-muted-foreground"
                  }`}>
                    {step.completed ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </div>
                  <span className="text-xs text-center">{step.title}</span>
                </div>
              );
            })}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <Form {...step1Form}>
              <form onSubmit={step1Form.handleSubmit(onStep1Submit)} className="space-y-4">
                <FormField
                  control={step1Form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your first name" {...field} />
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
                        <Input placeholder="Enter your last name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={step1Form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Enter your email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  Continue
                </Button>
              </form>
            </Form>
          )}

          {/* Step 2: Security */}
          {currentStep === 2 && (
            <Form {...step2Form}>
              <form onSubmit={step2Form.handleSubmit(onStep2Submit)} className="space-y-4">
                <FormField
                  control={step2Form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Create a password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={step2Form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Confirm your password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex space-x-2">
                  <Button type="button" variant="outline" onClick={goBack} className="flex-1">
                    Back
                  </Button>
                  <Button type="submit" className="flex-1" disabled={otpLoading}>
                    {otpLoading ? "Sending..." : "Continue"}
                  </Button>
                </div>
              </form>
            </Form>
          )}

          {/* Step 3: Email OTP Verification */}
          {currentStep === 3 && (
            <Form {...step3OtpForm}>
              <form onSubmit={step3OtpForm.handleSubmit(onStep3OtpSubmit)} className="space-y-6">
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto">
                    <Mail className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold">Verify Your Email</h3>
                  <p className="text-sm text-muted-foreground">
                    We've sent a 6-digit verification code to<br />
                    <span className="font-medium">{formData.email}</span>
                  </p>
                </div>

                <FormField
                  control={step3OtpForm.control}
                  name="otp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Verification Code</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter 6-digit code"
                          {...field}
                          className="text-center text-lg tracking-widest"
                          maxLength={6}
                          autoComplete="one-time-code"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="text-center space-y-2">
                  {otpCountdown === 0 ? (
                    <div className="text-sm text-red-600">
                      Code has expired. Please request a new one.
                    </div>
                  ) : canResendOtp ? (
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">
                        Code expires in {Math.floor(otpCountdown / 60)}:{(otpCountdown % 60).toString().padStart(2, '0')}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Didn't receive the code?
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">
                        Code expires in {Math.floor(otpCountdown / 60)}:{(otpCountdown % 60).toString().padStart(2, '0')}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Resend available in {Math.floor((otpCountdown - 480) / 60)}:{((otpCountdown - 480) % 60).toString().padStart(2, '0')}
                      </div>
                    </div>
                  )}

                  {(canResendOtp || otpCountdown === 0) && (
                    <Button
                      type="button"
                      variant="link"
                      onClick={resendOtp}
                      disabled={otpLoading}
                      className="text-sm p-0 h-auto"
                    >
                      {otpLoading ? "Sending..." : "Resend verification code"}
                    </Button>
                  )}
                </div>

                <div className="flex space-x-2">
                  <Button type="button" variant="outline" onClick={goBack} className="flex-1">
                    Back
                  </Button>
                  <Button type="submit" className="flex-1" disabled={otpLoading}>
                    {otpLoading ? "Verifying..." : "Verify Email"}
                  </Button>
                </div>
              </form>
            </Form>
          )}

          {/* Step 4: Role-specific comprehensive forms */}
          {currentStep === 4 && role === "patient" && (
            <Form {...step4PatientForm}>
              <form onSubmit={step4PatientForm.handleSubmit(onStep4Submit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={step4PatientForm.control}
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
                    control={step4PatientForm.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <FormControl>
                          <select {...field} className="w-full p-2 border rounded">
                            <option value="M">Male</option>
                            <option value="F">Female</option>
                            <option value="O">Other</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={step4PatientForm.control}
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

                <div className="space-y-2">
                  <h4 className="font-medium">Address</h4>
                  <FormField
                    control={step4PatientForm.control}
                    name="address.street"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Main Street" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={step4PatientForm.control}
                      name="address.city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="City" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={step4PatientForm.control}
                      name="address.state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <Input placeholder="State" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={step4PatientForm.control}
                      name="address.zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ZIP Code</FormLabel>
                          <FormControl>
                            <Input placeholder="12345" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Emergency Contact</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={step4PatientForm.control}
                      name="emergencyContact.name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Emergency contact name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={step4PatientForm.control}
                      name="emergencyContact.phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Phone</FormLabel>
                          <FormControl>
                            <Input placeholder="(555) 123-4567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={step4PatientForm.control}
                    name="emergencyContact.relation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Relationship</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Spouse, Parent, Sibling" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex space-x-2">
                  <Button type="button" variant="outline" onClick={goBack} className="flex-1">
                    Back
                  </Button>
                  <Button type="submit" className="flex-1" disabled={isLoading}>
                    Create Account
                  </Button>
                </div>
              </form>
            </Form>
          )}

          {/* Step 4: Doctor Professional Information */}
          {currentStep === 4 && role === "doctor" && (
            <Form {...step4DoctorForm}>
              <form onSubmit={step4DoctorForm.handleSubmit(onStep4Submit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={step4DoctorForm.control}
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
                    control={step4DoctorForm.control}
                    name="licenseNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Medical License Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter license number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={step4DoctorForm.control}
                    name="npiNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>NPI Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter NPI number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={step4DoctorForm.control}
                    name="deaNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>DEA Number (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter DEA number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={step4DoctorForm.control}
                  name="primarySpecialty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Specialty</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Internal Medicine, Cardiology" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <h4 className="font-medium">Practice Address</h4>
                  <FormField
                    control={step4DoctorForm.control}
                    name="address.street"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Medical Center Dr" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={step4DoctorForm.control}
                      name="address.city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="City" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={step4DoctorForm.control}
                      name="address.state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <Input placeholder="State" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={step4DoctorForm.control}
                      name="address.zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ZIP Code</FormLabel>
                          <FormControl>
                            <Input placeholder="12345" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button type="button" variant="outline" onClick={goBack} className="flex-1">
                    Back
                  </Button>
                  <Button type="submit" className="flex-1" disabled={isLoading}>
                    Create Account
                  </Button>
                </div>
              </form>
            </Form>
          )}

          {/* Step 4: Pharmacy Information */}
          {currentStep === 4 && role === "pharmacy" && (
            <Form {...step4PharmacyForm}>
              <form onSubmit={step4PharmacyForm.handleSubmit(onStep4Submit)} className="space-y-4">
                <FormField
                  control={step4PharmacyForm.control}
                  name="organizationName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pharmacy Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter pharmacy name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={step4PharmacyForm.control}
                    name="licenseNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pharmacy License Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter license number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={step4PharmacyForm.control}
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={step4PharmacyForm.control}
                    name="deaNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>DEA Number (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter DEA number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={step4PharmacyForm.control}
                    name="npiNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>NPI Number (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter NPI number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={step4PharmacyForm.control}
                  name="pharmacistInCharge"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pharmacist in Charge (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter pharmacist name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <h4 className="font-medium">Pharmacy Address</h4>
                  <FormField
                    control={step4PharmacyForm.control}
                    name="address.street"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Pharmacy St" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={step4PharmacyForm.control}
                      name="address.city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="City" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={step4PharmacyForm.control}
                      name="address.state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <Input placeholder="State" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={step4PharmacyForm.control}
                      name="address.zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ZIP Code</FormLabel>
                          <FormControl>
                            <Input placeholder="12345" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button type="button" variant="outline" onClick={goBack} className="flex-1">
                    Back
                  </Button>
                  <Button type="submit" className="flex-1" disabled={isLoading}>
                    Create Account
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
