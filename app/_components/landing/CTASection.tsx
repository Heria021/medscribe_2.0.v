"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  UserCheck,
  Stethoscope,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Shield,
  Zap
} from "lucide-react";
import Link from "next/link";

export function CTASection() {
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

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-6xl">
        {/* Main CTA Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Card className="relative overflow-hidden bg-muted/30 border-border">
            {/* Animated Background Elements */}
            <motion.div 
              className="absolute top-1/4 left-1/4 w-64 h-64 bg-muted/20 rounded-full blur-3xl"
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
              className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-muted/20 rounded-full blur-3xl"
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
            
            <CardContent className="relative p-12 text-center">
              <motion.div 
                className="space-y-8"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <motion.div className="space-y-4" variants={itemVariants}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <Badge variant="secondary" className="px-4 py-2 text-sm font-medium bg-muted text-muted-foreground">
                      <Sparkles className="h-4 w-4 mr-2" />
                      Start Your Healthcare Transformation
                    </Badge>
                  </motion.div>
                  
                  <motion.h2 
                    className="text-4xl sm:text-5xl font-bold tracking-tight"
                    variants={itemVariants}
                  >
                    Ready to Experience the Future of Healthcare?
                  </motion.h2>
                  
                  <motion.p 
                    className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
                    variants={itemVariants}
                  >
                    Join thousands of healthcare professionals and patients who trust MedScribe 
                    for their medical documentation, patient management, and AI-powered healthcare insights.
                  </motion.p>
                </motion.div>

                {/* Dual CTA Buttons */}
                <motion.div 
                  className="flex flex-col sm:flex-row gap-6 justify-center items-center"
                  variants={itemVariants}
                >
                  <Link href="/auth/select-role">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button size="lg" className="px-10 py-6 text-lg font-semibold">
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
                      <Button variant="outline" size="lg" className="px-10 py-6 text-lg font-semibold border-2">
                        <Stethoscope className="h-6 w-6 mr-3" />
                        Join as Doctor
                      </Button>
                    </motion.div>
                  </Link>
                </motion.div>

                {/* Benefits Grid */}
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8"
                  variants={containerVariants}
                >
                  {[
                    { icon: CheckCircle, title: "Free to Get Started", desc: "No credit card required. Start using MedScribe immediately." },
                    { icon: Zap, title: "Instant Setup", desc: "Get up and running in under 5 minutes with guided onboarding." },
                    { icon: Shield, title: "Enterprise Security", desc: "HIPAA compliant with bank-level encryption and security." }
                  ].map((benefit, index) => (
                    <motion.div 
                      key={index}
                      className="flex flex-col items-center text-center space-y-3"
                      variants={itemVariants}
                      whileHover={{ y: -5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <motion.div 
                        className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <benefit.icon className="h-6 w-6 text-primary" />
                      </motion.div>
                      <h3 className="font-semibold">{benefit.title}</h3>
                      <p className="text-sm text-muted-foreground">{benefit.desc}</p>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Additional Trust Indicators */}
                <motion.div 
                  className="flex flex-wrap justify-center items-center gap-6 pt-6 text-sm text-muted-foreground"
                  variants={containerVariants}
                >
                  {[
                    "30-day free trial",
                    "Cancel anytime", 
                    "24/7 support",
                    "Data migration included"
                  ].map((item, index) => (
                    <motion.div 
                      key={index}
                      className="flex items-center gap-2"
                      variants={itemVariants}
                      whileHover={{ scale: 1.05 }}
                    >
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>{item}</span>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Secondary CTA Cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          {[
            {
              icon: UserCheck,
              title: "For Patients",
              description: "Take control of your health with AI-powered medical documentation and personalized health insights.",
              buttonText: "Start Your Health Journey",
              variant: "default" as const
            },
            {
              icon: Stethoscope,
              title: "For Doctors", 
              description: "Streamline your practice with intelligent patient management and AI-powered clinical documentation.",
              buttonText: "Transform Your Practice",
              variant: "outline" as const
            }
          ].map((cta, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="border-border/50 hover:border-border transition-colors bg-muted/20">
                <CardContent className="p-8 text-center">
                  <div className="space-y-4">
                    <motion.div 
                      className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <cta.icon className="h-8 w-8 text-primary-foreground" />
                    </motion.div>
                    <h3 className="text-2xl font-bold">{cta.title}</h3>
                    <p className="text-muted-foreground">
                      {cta.description}
                    </p>
                    <Link href="/auth/select-role">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button variant={cta.variant} className="w-full">
                          {cta.buttonText}
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </motion.div>
                    </Link>
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
