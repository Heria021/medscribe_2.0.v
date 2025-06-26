"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Stethoscope,
  UserCheck,
  Bot,
  Shield,
  Clock,
  MessageCircle,
  FileText,
  Calendar,
  Activity,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Heart,
  Brain,
  Zap,
  Mic
} from "lucide-react";
import Link from "next/link";

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user is authenticated, show loading while redirecting
  if (session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show landing page for unauthenticated users

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
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

      {/* Hero Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/50 dark:from-blue-950/20 dark:via-transparent dark:to-purple-950/20"></div>
        <div className="container mx-auto max-w-7xl relative">
          <div className="text-center space-y-12">
            <div className="space-y-6">
              <Badge variant="secondary" className="px-6 py-3 text-base font-medium bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 border-0">
                <Sparkles className="h-5 w-5 mr-2" />
                AI-Powered Medical Revolution
              </Badge>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
                Your Health Journey,{" "}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AI-Enhanced
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                Transform your healthcare experience with MedScribe 2.0 - where cutting-edge AI meets personalized patient care.
                Generate clinical notes from voice, chat with your AI health assistant, and seamlessly connect with your doctors.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link href="/auth/select-role">
                <Button size="lg" className="px-10 py-6 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all">
                  <UserCheck className="h-6 w-6 mr-3" />
                  Start Your Health Journey
                  <ArrowRight className="h-6 w-6 ml-3" />
                </Button>
              </Link>
              <Link href="/auth/select-role">
                <Button variant="outline" size="lg" className="px-10 py-6 text-lg font-semibold border-2 hover:bg-muted/50">
                  <Stethoscope className="h-6 w-6 mr-3" />
                  Healthcare Provider Access
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 pt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-500" />
                <span className="font-medium">HIPAA Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-blue-500" />
                <span className="font-medium">AI-Powered</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-purple-500" />
                <span className="font-medium">24/7 Available</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-medium">Clinically Validated</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Features Showcase */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center space-y-6 mb-20">
            <Badge variant="outline" className="px-4 py-2 text-sm font-medium">
              <Brain className="h-4 w-4 mr-2" />
              Powered by Advanced AI
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
              Revolutionary AI Features
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Experience healthcare like never before with our cutting-edge AI technology designed specifically for patients
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Voice-to-SOAP Feature */}
            <div className="space-y-8">
              <Card className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
                <CardContent className="p-0">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center">
                      <Mic className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                        Voice-to-SOAP Generation
                      </h3>
                      <Badge className="mt-2 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                        AI-Powered Transcription
                      </Badge>
                    </div>
                  </div>
                  <p className="text-lg text-blue-700 dark:text-blue-300 mb-6">
                    Simply speak about your symptoms, concerns, or health updates. Our advanced AI instantly converts your voice into structured clinical SOAP notes with medical accuracy and professional formatting.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-sm font-medium">Real-time Processing</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-sm font-medium">Medical Terminology</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-sm font-medium">Quality Scoring</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-sm font-medium">Auto-Highlighting</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* AI Assistant Feature */}
            <div className="space-y-8">
              <Card className="p-8 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
                <CardContent className="p-0">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center">
                      <Bot className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                        Personal AI Health Assistant
                      </h3>
                      <Badge className="mt-2 bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                        24/7 Medical Support
                      </Badge>
                    </div>
                  </div>
                  <p className="text-lg text-purple-700 dark:text-purple-300 mb-6">
                    Chat with your intelligent health companion that understands your medical history, SOAP notes, treatments, and medications. Get instant insights, explanations, and personalized health guidance.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-sm font-medium">Medical Context</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-sm font-medium">Personalized Insights</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-sm font-medium">Treatment Guidance</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-sm font-medium">Medication Tracking</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Patient Journey Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center space-y-6 mb-20">
            <Badge variant="outline" className="px-4 py-2 text-sm font-medium">
              <UserCheck className="h-4 w-4 mr-2" />
              Your Health Journey
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
              How MedScribe Transforms Your Healthcare
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              From voice recordings to comprehensive health insights - see how our AI-powered platform works for you
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Step 1: Record */}
            <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30">
              <div className="absolute top-4 right-4">
                <Badge className="bg-blue-500 text-white">Step 1</Badge>
              </div>
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mb-6">
                  <Mic className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-blue-900 dark:text-blue-100">
                  Record Your Voice
                </h3>
                <p className="text-blue-700 dark:text-blue-300 mb-6">
                  Simply speak about your symptoms, health concerns, or medical updates. Our AI listens and understands medical context with 95%+ accuracy.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Natural speech recognition</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Medical terminology understanding</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Multi-language support</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Step 2: AI Processing */}
            <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30">
              <div className="absolute top-4 right-4">
                <Badge className="bg-purple-500 text-white">Step 2</Badge>
              </div>
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center mb-6">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-purple-900 dark:text-purple-100">
                  AI Analysis & Processing
                </h3>
                <p className="text-purple-700 dark:text-purple-300 mb-6">
                  Our advanced AI analyzes your input, extracts medical information, and structures it into professional clinical documentation.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Clinical data extraction</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Quality assurance scoring</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Medical highlighting</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Step 3: Results */}
            <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30">
              <div className="absolute top-4 right-4">
                <Badge className="bg-green-500 text-white">Step 3</Badge>
              </div>
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mb-6">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-green-900 dark:text-green-100">
                  Professional SOAP Notes
                </h3>
                <p className="text-green-700 dark:text-green-300 mb-6">
                  Receive structured clinical notes that you can share with doctors, track over time, and use for better healthcare communication.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Shareable with doctors</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Historical tracking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Export capabilities</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Comprehensive Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Everything You Need for Better Healthcare
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive tools designed specifically for patients to manage their health journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* AI Assistant */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-border">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30 group-hover:scale-110 transition-transform">
                    <Bot className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <CardTitle className="text-xl">AI Health Assistant</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Chat with your personal AI assistant about medical records, symptoms, and get instant health insights powered by advanced AI.
                </p>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-muted-foreground">24/7 Available</span>
                </div>
              </CardContent>
            </Card>

            {/* Smart Records */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-border">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30 group-hover:scale-110 transition-transform">
                    <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle className="text-xl">Smart Medical Records</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  AI-generated SOAP notes, treatment summaries, and comprehensive medical history tracking with intelligent insights.
                </p>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-muted-foreground">Auto-Generated</span>
                </div>
              </CardContent>
            </Card>

            {/* Secure Communication */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-border">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/30 group-hover:scale-110 transition-transform">
                    <MessageCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <CardTitle className="text-xl">Doctor Communication</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Direct, secure messaging with your healthcare providers. Share updates, ask questions, and stay connected.
                </p>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-muted-foreground">HIPAA Compliant</span>
                </div>
              </CardContent>
            </Card>

            {/* Appointment Management */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-border">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-900/30 group-hover:scale-110 transition-transform">
                    <Calendar className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <CardTitle className="text-xl">Smart Scheduling</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Easy appointment booking, automated reminders, and seamless calendar integration with your healthcare team.
                </p>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-muted-foreground">Real-time Updates</span>
                </div>
              </CardContent>
            </Card>

            {/* Treatment Tracking */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-border">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/30 group-hover:scale-110 transition-transform">
                    <Activity className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <CardTitle className="text-xl">Treatment Monitoring</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Track medications, monitor treatment progress, and receive personalized health recommendations.
                </p>
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-muted-foreground">Personalized Care</span>
                </div>
              </CardContent>
            </Card>

            {/* AI Insights */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-border">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30 group-hover:scale-110 transition-transform">
                    <Brain className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <CardTitle className="text-xl">Health Insights</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  AI-powered health analytics, trend analysis, and proactive recommendations for better health outcomes.
                </p>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-muted-foreground">Predictive Analytics</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-primary/20">
            <CardContent className="p-12 text-center">
              <div className="space-y-6">
                <div className="flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
                    <UserCheck className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <div className="space-y-4">
                  <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                    Ready to Transform Your Healthcare Experience?
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Join thousands of patients who trust MedScribe for their healthcare management.
                    Start your journey to better health today.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Link href="/auth/select-role">
                    <Button size="lg" className="px-8 py-6 text-lg font-semibold">
                      <UserCheck className="h-5 w-5 mr-2" />
                      Start as Patient
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  </Link>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Free to get started</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <Stethoscope className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold">MedScribe</span>
              </div>
              <p className="text-sm text-muted-foreground">
                AI-powered medical platform transforming healthcare through intelligent automation and patient-centered care.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">For Patients</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Medical Records</li>
                <li>AI Health Assistant</li>
                <li>Appointment Booking</li>
                <li>Treatment Tracking</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">For Doctors</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>SOAP Note Generation</li>
                <li>Patient Management</li>
                <li>AI Transcription</li>
                <li>Clinical Insights</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Platform</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Security & Privacy</li>
                <li>HIPAA Compliance</li>
                <li>24/7 Support</li>
                <li>API Access</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border/40 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              © 2024 MedScribe 2.0. All rights reserved.
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-muted-foreground">System Online</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                v2.0
              </Badge>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
