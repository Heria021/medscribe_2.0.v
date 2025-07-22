"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Stethoscope,
  Users,
  Pill,
  Brain,
  Shield,
  Zap,
  CheckCircle,
  ArrowRight,
  Star,
  Heart,
  Activity,
  FileText,
  MessageSquare,
  Calendar,
  Sparkles,
  Building2,
  UserCheck,
  Clock,
  Award,
  Globe,
  Lock
} from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);

    // Redirect authenticated users to their dashboard
    if (session?.user?.role) {
      const roleRoutes = {
        doctor: "/doctor",
        patient: "/patient",
        pharmacy: "/pharmacy"
      };
      router.push(roleRoutes[session.user.role as keyof typeof roleRoutes] || "/");
    }
  }, [session, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Stethoscope className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">MedScribe 2.0</span>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Link href="/auth/login">
              <Button variant="outline" size="sm">Sign In</Button>
            </Link>
            <Link href="/auth/select-role">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge variant="secondary" className="mb-4">
            <Sparkles className="h-3 w-3 mr-1" />
            AI-Powered Healthcare Platform
          </Badge>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Revolutionizing Healthcare with{" "}
            <span className="text-primary">AI-Powered</span> Medical Documentation
          </h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            MedScribe 2.0 connects doctors, patients, and pharmacies through intelligent medical documentation,
            seamless communication, and AI-assisted healthcare management.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/auth/select-role">
              <Button size="lg" className="gap-2">
                Start Your Journey
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="gap-2">
              <Activity className="h-4 w-4" />
              Watch Demo
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              HIPAA Compliant
            </div>
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              End-to-End Encrypted
            </div>
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              FDA Guidelines
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              24/7 Available
            </div>
          </div>
        </div>
      </section>

      {/* Role-Based Features */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Designed for Every Healthcare Professional
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tailored experiences for doctors, patients, and pharmacies with role-specific features and workflows.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Doctors */}
            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mb-6">
                  <Stethoscope className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>

                <h3 className="text-2xl font-bold mb-4">For Doctors</h3>
                <p className="text-muted-foreground mb-6">
                  Streamline your practice with AI-powered clinical documentation and patient management tools.
                </p>

                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">AI-Generated SOAP Notes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Patient Management Dashboard</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">E-Prescribing & Treatment Plans</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Clinical Decision Support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Telemedicine Integration</span>
                  </li>
                </ul>

                <Link href="/auth/select-role">
                  <Button className="w-full group-hover:bg-blue-600 transition-colors">
                    Start as Doctor
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Patients */}
            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mb-6">
                  <Heart className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>

                <h3 className="text-2xl font-bold mb-4">For Patients</h3>
                <p className="text-muted-foreground mb-6">
                  Take control of your health with comprehensive medical records and seamless provider communication.
                </p>

                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Personal Health Dashboard</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Medical Records Access</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Appointment Scheduling</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Prescription Management</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">AI Health Assistant</span>
                  </li>
                </ul>

                <Link href="/auth/select-role">
                  <Button className="w-full group-hover:bg-green-600 transition-colors">
                    Start as Patient
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Pharmacies */}
            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mb-6">
                  <Pill className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>

                <h3 className="text-2xl font-bold mb-4">For Pharmacies</h3>
                <p className="text-muted-foreground mb-6">
                  Optimize your pharmacy operations with integrated prescription management and patient services.
                </p>

                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Prescription Processing</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Inventory Management</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Drug Interaction Checking</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Patient Consultation Tools</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Insurance Processing</span>
                  </li>
                </ul>

                <Link href="/auth/select-role">
                  <Button className="w-full group-hover:bg-purple-600 transition-colors">
                    Start as Pharmacy
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Powered by Advanced AI Technology
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the future of healthcare with our cutting-edge AI features designed to enhance patient care and streamline medical workflows.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">AI SOAP Generation</h3>
              <p className="text-muted-foreground text-sm">
                Automatically generate structured clinical notes from audio recordings with 95%+ accuracy
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Medical Assistant</h3>
              <p className="text-muted-foreground text-sm">
                Intelligent AI assistant providing clinical decision support and patient guidance
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Safety Checks</h3>
              <p className="text-muted-foreground text-sm">
                Real-time drug interaction checking and allergy screening for patient safety
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Real-time Sync</h3>
              <p className="text-muted-foreground text-sm">
                Instant synchronization across all devices and healthcare providers
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How MedScribe Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Simple, secure, and efficient healthcare management in three easy steps.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 text-primary-foreground font-bold text-lg">
                1
              </div>
              <h3 className="text-xl font-semibold mb-4">Choose Your Role</h3>
              <p className="text-muted-foreground">
                Sign up as a doctor, patient, or pharmacy to access role-specific features and workflows tailored to your needs.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 text-primary-foreground font-bold text-lg">
                2
              </div>
              <h3 className="text-xl font-semibold mb-4">Connect & Collaborate</h3>
              <p className="text-muted-foreground">
                Build your healthcare network by connecting with patients, doctors, and pharmacies for seamless care coordination.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 text-primary-foreground font-bold text-lg">
                3
              </div>
              <h3 className="text-xl font-semibold mb-4">Experience AI-Powered Care</h3>
              <p className="text-muted-foreground">
                Leverage advanced AI features for documentation, decision support, and enhanced patient outcomes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Stethoscope className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">MedScribe 2.0</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Revolutionizing healthcare through AI-powered medical documentation and seamless care coordination.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">For Healthcare Providers</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/auth/select-role" className="hover:text-foreground">Doctor Registration</Link></li>
                <li><Link href="/auth/select-role" className="hover:text-foreground">Pharmacy Registration</Link></li>
                <li><Link href="#" className="hover:text-foreground">API Documentation</Link></li>
                <li><Link href="#" className="hover:text-foreground">Integration Guide</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">For Patients</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/auth/select-role" className="hover:text-foreground">Patient Registration</Link></li>
                <li><Link href="#" className="hover:text-foreground">Health Records</Link></li>
                <li><Link href="#" className="hover:text-foreground">Find Doctors</Link></li>
                <li><Link href="#" className="hover:text-foreground">Support Center</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground">About Us</Link></li>
                <li><Link href="#" className="hover:text-foreground">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-foreground">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-foreground">Contact</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 MedScribe 2.0. All rights reserved. HIPAA Compliant Healthcare Platform.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
