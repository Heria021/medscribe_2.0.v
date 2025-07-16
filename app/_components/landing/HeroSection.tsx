"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  UserCheck,
  Stethoscope,
  Shield,
  Bot,
  Clock,
  CheckCircle,
  Zap,
  Heart,
  Brain
} from "lucide-react";
import Link from "next/link";

export function HeroSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Animated Background Elements */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-muted/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-muted/20 rounded-full blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.1, 0.2]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 4
        }}
      />

      <div className="container mx-auto max-w-7xl relative">
        <motion.div
          className="text-center space-y-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="space-y-8" variants={itemVariants}>
            <motion.div variants={floatingVariants} animate="animate">
              <Badge variant="secondary" className="px-6 py-3 text-base font-medium bg-muted/50 border-border">
                <Sparkles className="h-5 w-5 mr-2" />
                Revolutionary AI Healthcare Platform
              </Badge>
            </motion.div>

            <motion.h1
              className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight"
              variants={itemVariants}
            >
              Healthcare Reimagined with{" "}
              <span className="relative">
                <span className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                  AI Intelligence
                </span>
                <motion.div
                  className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-primary/50 to-primary/20 rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 1, duration: 0.8 }}
                />
              </span>
            </motion.h1>

            <motion.p
              className="text-xl sm:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed"
              variants={itemVariants}
            >
              MedScribe 2.0 transforms healthcare delivery with voice-powered SOAP generation,
              intelligent patient management, and AI-driven medical insights for both doctors and patients.
            </motion.p>
          </motion.div>

          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            variants={itemVariants}
          >
            <Link href="/auth/select-role">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button size="lg" className="px-10 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all">
                  <UserCheck className="h-6 w-6 mr-3" />
                  Start as Patient
                  <ArrowRight className="h-6 w-6 ml-3" />
                </Button>
              </motion.div>
            </Link>
            <Link href="/auth/select-role">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button variant="outline" size="lg" className="px-10 py-6 text-lg font-semibold border-2 hover:bg-muted/50">
                  <Stethoscope className="h-6 w-6 mr-3" />
                  Join as Doctor
                </Button>
              </motion.div>
            </Link>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            className="flex flex-wrap justify-center items-center gap-8 pt-8 text-sm text-muted-foreground"
            variants={itemVariants}
          >
            {[
              { icon: Shield, text: "HIPAA Compliant" },
              { icon: Bot, text: "AI-Powered" },
              { icon: Clock, text: "24/7 Available" },
              { icon: CheckCircle, text: "Clinically Validated" }
            ].map((item, index) => (
              <motion.div
                key={index}
                className="flex items-center gap-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 + index * 0.1 }}
              >
                <item.icon className="h-5 w-5 text-primary" />
                <span className="font-medium">{item.text}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Key Benefits Preview */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 max-w-4xl mx-auto"
            variants={containerVariants}
          >
            {[
              { icon: Zap, title: "Instant SOAP Notes", desc: "Voice-to-text medical documentation in seconds" },
              { icon: Brain, title: "AI Health Assistant", desc: "Personalized medical insights and guidance" },
              { icon: Heart, title: "Seamless Care", desc: "Connected patient-doctor communication" }
            ].map((benefit, index) => (
              <motion.div
                key={index}
                className="flex flex-col items-center text-center space-y-3 p-6 rounded-2xl bg-muted/30 border border-border hover:bg-muted/50 transition-colors"
                variants={itemVariants}
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                  <benefit.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-foreground">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
