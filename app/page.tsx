"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Stethoscope } from "lucide-react";
import Link from "next/link";
import { HeroSection } from "./_components/landing/HeroSection";
import { FeaturesSection } from "./_components/landing/FeaturesSection";
import { RoleBasedFeatures } from "./_components/landing/RoleBasedFeatures";
import { TestimonialsSection } from "./_components/landing/TestimonialsSection";
import { StatsSection } from "./_components/landing/StatsSection";
import { CTASection } from "./_components/landing/CTASection";
import { Footer } from "./_components/landing/Footer";

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return; // Still loading

    if (session) {
      // User is authenticated, redirect to appropriate dashboard
      if (session.user.role === "doctor") {
        router.push("/doctor/dashboard");
      } else if (session.user.role === "patient") {
        router.push("/patient/dashboard");
      }
    }
    // If no session, show the landing page (don't redirect)
  }, [session, status, router]);

  // Show loading spinner while checking authentication
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user is authenticated, show loading while redirecting
  if (session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show landing page for unauthenticated users
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-sm">
                <Stethoscope className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-foreground">MedScribe</span>
                <span className="text-xs text-muted-foreground font-medium">v2.0</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <nav className="hidden md:flex items-center gap-6 text-sm">
                <Link href="/for-patients" className="text-muted-foreground hover:text-foreground transition-colors">
                  For Patients
                </Link>
                <Link href="/for-doctors" className="text-muted-foreground hover:text-foreground transition-colors">
                  For Doctors
                </Link>
              </nav>
              <ThemeToggle />
              <Link href="/auth/select-role">
                <Button variant="outline" size="sm">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <RoleBasedFeatures />
        <TestimonialsSection />
        <CTASection />
      </main>

      <Footer />
    </div>
  );
}
