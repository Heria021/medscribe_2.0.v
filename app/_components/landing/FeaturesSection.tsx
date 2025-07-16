"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  Mic,
  Bot,
  Brain,
  MessageCircle,
  Calendar,
  Activity,
  FileText,
  Shield,
  Zap,
  CheckCircle
} from "lucide-react";

export function FeaturesSection() {
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
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const features = [
    {
      icon: Mic,
      title: "Voice-to-SOAP Generation",
      description: "Transform spoken medical notes into structured SOAP documentation with 95%+ accuracy using advanced AI transcription.",
      badge: "AI-Powered",
      benefits: [
        "Real-time voice processing",
        "Medical terminology recognition",
        "Quality scoring & validation",
        "Auto-highlighting key terms"
      ]
    },
    {
      icon: Bot,
      title: "Personal AI Health Assistant",
      description: "24/7 intelligent medical companion that understands your health history, medications, and provides personalized insights.",
      badge: "24/7 Available",
      benefits: [
        "Contextual health guidance",
        "Medication interaction checks",
        "Symptom analysis",
        "Treatment recommendations"
      ]
    },
    {
      icon: Brain,
      title: "Intelligent Patient Management",
      description: "Comprehensive patient care coordination with AI-driven insights, treatment tracking, and automated workflows.",
      badge: "Smart Analytics",
      benefits: [
        "Automated care plans",
        "Progress monitoring",
        "Risk assessment",
        "Outcome predictions"
      ]
    },
    {
      icon: MessageCircle,
      title: "Secure Communication Hub",
      description: "HIPAA-compliant messaging platform connecting patients and doctors with encrypted, real-time communication.",
      badge: "HIPAA Secure",
      benefits: [
        "End-to-end encryption",
        "Multi-media sharing",
        "Read receipts",
        "Emergency alerts"
      ]
    },
    {
      icon: Calendar,
      title: "Smart Appointment System",
      description: "Intelligent scheduling with automated reminders, conflict resolution, and seamless calendar integration.",
      badge: "Automated",
      benefits: [
        "Auto-scheduling",
        "Smart reminders",
        "Conflict detection",
        "Calendar sync"
      ]
    },
    {
      icon: Activity,
      title: "Treatment Analytics",
      description: "Advanced analytics and reporting for treatment outcomes, patient progress, and clinical decision support.",
      badge: "Data-Driven",
      benefits: [
        "Outcome tracking",
        "Trend analysis",
        "Predictive insights",
        "Custom reports"
      ]
    }
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          className="text-center space-y-6 mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Badge variant="outline" className="px-4 py-2 text-sm font-medium">
            <Zap className="h-4 w-4 mr-2" />
            Comprehensive Healthcare Platform
          </Badge>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Everything You Need for Modern Healthcare
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover how MedScribe's AI-powered features transform every aspect of healthcare delivery
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="p-8 bg-card border-border hover:shadow-lg transition-all duration-300 h-full">
                <CardContent className="p-0">
                  <div className="flex items-start gap-4 mb-6">
                    <motion.div
                      className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center flex-shrink-0"
                      whileHover={{ rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <feature.icon className="h-8 w-8 text-primary-foreground" />
                    </motion.div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-2 text-foreground">{feature.title}</h3>
                      <Badge variant="secondary" className="bg-muted text-muted-foreground">
                        {feature.badge}
                      </Badge>
                    </div>
                  </div>

                  <p className="text-lg mb-6 text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {feature.benefits.map((benefit, benefitIndex) => (
                      <motion.div
                        key={benefitIndex}
                        className="flex items-center gap-2"
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: benefitIndex * 0.1 }}
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
      </div>
    </section>
  );
}
