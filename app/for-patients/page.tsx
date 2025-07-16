"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Stethoscope,
  ArrowRight,
  UserCheck,
  Bot,
  Mic,
  Calendar,
  Activity,
  MessageCircle,
  History,
  Heart,
  Brain,
  Shield,
  Zap,
  CheckCircle,
  Star,
  TrendingUp,
  Clock,
  Award,
  Sparkles,
  FileText,
  Users
} from "lucide-react";
import Link from "next/link";

export default function ForPatientsPage() {
  const patientFeatures = [
    {
      icon: Mic,
      title: "Voice-Powered SOAP Notes",
      description: "Record your symptoms and health updates using voice. Our AI instantly converts your speech into professional medical documentation.",
      benefits: ["Natural speech recognition", "Medical terminology understanding", "Instant SOAP generation", "Quality scoring"],
      gradient: "from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30",
      borderColor: "border-blue-200 dark:border-blue-800",
      iconBg: "bg-blue-500"
    },
    {
      icon: Bot,
      title: "Personal AI Health Assistant",
      description: "Chat with your intelligent health companion 24/7. Get personalized insights about your medical history, treatments, and medications.",
      benefits: ["24/7 availability", "Personalized guidance", "Medical context awareness", "Treatment explanations"],
      gradient: "from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30",
      borderColor: "border-purple-200 dark:border-purple-800",
      iconBg: "bg-purple-500"
    },
    {
      icon: Calendar,
      title: "Smart Appointment Management",
      description: "Book appointments, receive automated reminders, and manage your healthcare schedule with intelligent conflict detection.",
      benefits: ["Easy booking", "Smart reminders", "Calendar integration", "Reschedule requests"],
      gradient: "from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30",
      borderColor: "border-green-200 dark:border-green-800",
      iconBg: "bg-green-500"
    },
    {
      icon: Activity,
      title: "Treatment Tracking",
      description: "Monitor your treatment progress, track medications, and receive personalized health recommendations based on your data.",
      benefits: ["Progress monitoring", "Medication tracking", "Health insights", "Outcome analysis"],
      gradient: "from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/30",
      borderColor: "border-orange-200 dark:border-orange-800",
      iconBg: "bg-orange-500"
    },
    {
      icon: MessageCircle,
      title: "Secure Doctor Communication",
      description: "Direct, encrypted messaging with your healthcare providers. Share updates, ask questions, and stay connected securely.",
      benefits: ["HIPAA compliant", "Real-time messaging", "File sharing", "Emergency alerts"],
      gradient: "from-indigo-50 to-indigo-100 dark:from-indigo-950/30 dark:to-indigo-900/30",
      borderColor: "border-indigo-200 dark:border-indigo-800",
      iconBg: "bg-indigo-500"
    },
    {
      icon: History,
      title: "Complete Medical History",
      description: "Access your complete medical records, SOAP notes, and treatment history in one organized, searchable platform.",
      benefits: ["Centralized records", "Search functionality", "Export capabilities", "Sharing controls"],
      gradient: "from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/30",
      borderColor: "border-red-200 dark:border-red-800",
      iconBg: "bg-red-500"
    }
  ];

  const stats = [
    { icon: Users, value: "50,000+", label: "Patients", description: "Active users managing their health" },
    { icon: TrendingUp, value: "95%", label: "Satisfaction", description: "Patient satisfaction rate" },
    { icon: Clock, value: "24/7", label: "AI Support", description: "Always available health assistant" },
    { icon: Award, value: "4.9/5", label: "App Rating", description: "Average user rating" }
  ];

  const benefits = [
    {
      icon: Heart,
      title: "Take Control of Your Health",
      description: "Empower yourself with AI-powered tools to better understand and manage your health journey."
    },
    {
      icon: Brain,
      title: "Intelligent Health Insights",
      description: "Get personalized recommendations and insights based on your medical history and current health status."
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your health data is protected with bank-level encryption and HIPAA compliance."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-sm">
                <Stethoscope className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-foreground">MedScribe</span>
                <span className="text-xs text-muted-foreground font-medium">v2.0</span>
              </div>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/for-doctors" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                For Doctors
              </Link>
              <ThemeToggle />
              <Link href="/auth/select-role">
                <Button size="sm">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50/50 via-background to-green-100/50 dark:from-green-950/20 dark:via-background dark:to-green-900/20">
        <div className="container mx-auto max-w-6xl text-center">
          <Badge variant="secondary" className="px-6 py-3 text-base font-medium mb-8 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
            <UserCheck className="h-5 w-5 mr-2" />
            Designed for Patients
          </Badge>
          
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6">
            Your Health Journey,{" "}
            <span className="bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
              AI-Enhanced
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed">
            Take control of your health with MedScribe's AI-powered platform. Generate medical notes from voice, 
            chat with your personal health assistant, and seamlessly connect with your healthcare providers.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <Link href="/auth/select-role">
              <Button size="lg" className="px-10 py-6 text-lg font-semibold">
                <UserCheck className="h-6 w-6 mr-3" />
                Start Your Health Journey
                <ArrowRight className="h-6 w-6 ml-3" />
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" size="lg" className="px-10 py-6 text-lg font-semibold">
                Explore Features
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                    <stat.icon className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm font-semibold text-foreground">{stat.label}</div>
                <div className="text-xs text-muted-foreground">{stat.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Why Choose MedScribe for Your Health?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience healthcare like never before with our patient-centered approach
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <benefit.icon className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-bold">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-20">
            <Badge variant="outline" className="px-4 py-2 text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4 mr-2" />
              Comprehensive Patient Platform
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
              Everything You Need to Manage Your Health
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Discover powerful tools designed to put you in control of your healthcare journey
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {patientFeatures.map((feature, index) => (
              <Card
                key={index}
                className={`p-8 bg-gradient-to-br ${feature.gradient} ${feature.borderColor} border-2 hover:shadow-lg transition-all duration-300`}
              >
                <CardContent className="p-0">
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`w-16 h-16 ${feature.iconBg} rounded-2xl flex items-center justify-center`}>
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold">{feature.title}</h3>
                  </div>
                  
                  <p className="text-lg mb-6 text-muted-foreground">
                    {feature.description}
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {feature.benefits.map((benefit, benefitIndex) => (
                      <div key={benefitIndex} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm font-medium">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold tracking-tight mb-6">
            Ready to Take Control of Your Health?
          </h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Join thousands of patients who trust MedScribe for their healthcare management. 
            Start your journey to better health today.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href="/auth/select-role">
              <Button size="lg" className="px-10 py-6 text-lg font-semibold">
                <UserCheck className="h-6 w-6 mr-3" />
                Start Your Health Journey
                <ArrowRight className="h-6 w-6 ml-3" />
              </Button>
            </Link>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Free to get started • No credit card required</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
