"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
  Stethoscope,
  UserCheck,
  Bot,
  FileText,
  Users,
  Calendar,
  Activity,
  MessageCircle,
  Mic,
  History,
  Shield,
  Zap,
  Heart,
  Brain,
  CheckCircle,
  ArrowRight,
  Pill,
  ClipboardList
} from "lucide-react";
import Link from "next/link";

export function RoleBasedFeatures() {
  const [activeRole, setActiveRole] = useState<"patient" | "doctor">("patient");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0
    })
  };

  const patientFeatures = [
    {
      icon: Mic,
      title: "Voice-Powered SOAP Notes",
      description: "Record your symptoms and health updates using voice. Our AI instantly converts your speech into professional medical documentation.",
      benefits: ["Natural speech recognition", "Medical terminology understanding", "Instant SOAP generation", "Quality scoring"],
      highlight: "Most Popular"
    },
    {
      icon: Bot,
      title: "Personal AI Health Assistant",
      description: "Chat with your intelligent health companion 24/7. Get personalized insights about your medical history, treatments, and medications.",
      benefits: ["24/7 availability", "Personalized guidance", "Medical context awareness", "Treatment explanations"]
    },
    {
      icon: Calendar,
      title: "Smart Appointment Management",
      description: "Book appointments, receive automated reminders, and manage your healthcare schedule with intelligent conflict detection.",
      benefits: ["Easy booking", "Smart reminders", "Calendar integration", "Reschedule requests"]
    },
    {
      icon: Activity,
      title: "Treatment Tracking",
      description: "Monitor your treatment progress, track medications, and receive personalized health recommendations based on your data.",
      benefits: ["Progress monitoring", "Medication tracking", "Health insights", "Outcome analysis"]
    },
    {
      icon: MessageCircle,
      title: "Secure Doctor Communication",
      description: "Direct, encrypted messaging with your healthcare providers. Share updates, ask questions, and stay connected securely.",
      benefits: ["HIPAA compliant", "Real-time messaging", "File sharing", "Emergency alerts"]
    },
    {
      icon: History,
      title: "Complete Medical History",
      description: "Access your complete medical records, SOAP notes, and treatment history in one organized, searchable platform.",
      benefits: ["Centralized records", "Search functionality", "Export capabilities", "Sharing controls"]
    }
  ];

  const doctorFeatures = [
    {
      icon: Users,
      title: "Intelligent Patient Management",
      description: "Comprehensive patient roster with AI-driven insights, treatment tracking, and automated care coordination workflows.",
      benefits: ["Patient analytics", "Care coordination", "Risk assessment", "Automated workflows"],
      highlight: "Core Feature"
    },
    {
      icon: FileText,
      title: "AI-Powered Documentation",
      description: "Generate professional SOAP notes from voice recordings with medical accuracy and automated quality scoring.",
      benefits: ["Voice transcription", "Medical accuracy", "Quality scoring", "Template customization"]
    },
    {
      icon: Bot,
      title: "Clinical AI Assistant",
      description: "Advanced medical AI that provides clinical decision support, drug interaction checks, and evidence-based recommendations.",
      benefits: ["Clinical decision support", "Drug interactions", "Evidence-based insights", "Diagnostic assistance"]
    },
    {
      icon: Calendar,
      title: "Advanced Scheduling System",
      description: "Manage complex schedules, handle reschedule requests, and optimize appointment slots with intelligent automation.",
      benefits: ["Schedule optimization", "Conflict resolution", "Automated reminders", "Slot management"]
    },
    {
      icon: Pill,
      title: "E-Prescribing Platform",
      description: "Digital prescription management with drug interaction checks, pharmacy integration, and automated refill tracking.",
      benefits: ["Digital prescriptions", "Pharmacy integration", "Interaction checks", "Refill automation"]
    },
    {
      icon: ClipboardList,
      title: "Clinical Analytics",
      description: "Advanced reporting and analytics for patient outcomes, treatment effectiveness, and practice performance metrics.",
      benefits: ["Outcome tracking", "Performance metrics", "Custom reports", "Trend analysis"]
    }
  ];

  const currentFeatures = activeRole === "patient" ? patientFeatures : doctorFeatures;
  const direction = activeRole === "patient" ? -1 : 1;

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          className="text-center space-y-6 mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Badge variant="outline" className="px-4 py-2 text-sm font-medium">
            <Heart className="h-4 w-4 mr-2" />
            Tailored for Every Healthcare Role
          </Badge>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Built for Patients & Doctors
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover how MedScribe adapts to your specific healthcare needs with role-based features and workflows
          </p>
        </motion.div>

        {/* Enhanced Role Toggle */}
        <motion.div
          className="flex justify-center mb-12"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="relative flex bg-muted rounded-2xl p-2 shadow-lg">
            <motion.div
              className="absolute inset-y-2 bg-background rounded-xl shadow-md"
              animate={{
                x: activeRole === "patient" ? 4 : "calc(100% - 4px)",
                width: activeRole === "patient" ? "calc(50% - 4px)" : "calc(50% - 4px)"
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
            <Button
              variant="ghost"
              onClick={() => setActiveRole("patient")}
              className={`relative z-10 px-8 py-4 rounded-xl font-semibold transition-colors ${
                activeRole === "patient" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <UserCheck className="h-5 w-5 mr-2" />
              For Patients
            </Button>
            <Button
              variant="ghost"
              onClick={() => setActiveRole("doctor")}
              className={`relative z-10 px-8 py-4 rounded-xl font-semibold transition-colors ${
                activeRole === "doctor" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Stethoscope className="h-5 w-5 mr-2" />
              For Doctors
            </Button>
          </div>
        </motion.div>

        {/* Animated Features Grid */}
        <div className="relative overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={activeRole}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {currentFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="relative"
                >
                  {feature.highlight && (
                    <motion.div
                      className="absolute -top-3 -right-3 z-10"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.5 + index * 0.1, type: "spring" }}
                    >
                      <Badge className="bg-primary text-primary-foreground shadow-lg">
                        {feature.highlight}
                      </Badge>
                    </motion.div>
                  )}

                  <Card className="group hover:shadow-xl transition-all duration-500 border-border/50 hover:border-border bg-background/80 backdrop-blur-sm h-full">
                    <CardHeader className="pb-4">
                      <div className="flex items-start gap-4">
                        <motion.div
                          className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors flex-shrink-0"
                          whileHover={{ rotate: 10, scale: 1.1 }}
                          transition={{ type: "spring", stiffness: 400 }}
                        >
                          <feature.icon className="h-7 w-7 text-primary" />
                        </motion.div>
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors">
                            {feature.title}
                          </CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-muted-foreground mb-6 leading-relaxed">
                        {feature.description}
                      </p>
                      <div className="space-y-3">
                        {feature.benefits.map((benefit, benefitIndex) => (
                          <motion.div
                            key={benefitIndex}
                            className="flex items-center gap-3"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + benefitIndex * 0.1 }}
                          >
                            <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                            <span className="text-sm font-medium text-foreground">{benefit}</span>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <Link href="/auth/select-role">
            <Button size="lg" className="px-8 py-6 text-lg font-semibold">
              {activeRole === "patient" ? (
                <>
                  <UserCheck className="h-5 w-5 mr-2" />
                  Start as Patient
                </>
              ) : (
                <>
                  <Stethoscope className="h-5 w-5 mr-2" />
                  Join as Doctor
                </>
              )}
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
