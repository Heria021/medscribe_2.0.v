"use client";

import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { TrendingUp, Users, Clock, Award } from "lucide-react";

export function StatsSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const stats = [
    {
      icon: Users,
      value: "10,000+",
      label: "Healthcare Professionals",
      description: "Doctors and medical staff using MedScribe"
    },
    {
      icon: TrendingUp,
      value: "95%",
      label: "Accuracy Rate",
      description: "AI-powered medical transcription accuracy"
    },
    {
      icon: Clock,
      value: "75%",
      label: "Time Saved",
      description: "Reduction in documentation time"
    },
    {
      icon: Award,
      value: "99.9%",
      label: "Uptime",
      description: "Reliable healthcare platform availability"
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          className="text-center space-y-4 mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Badge variant="outline" className="px-4 py-2 text-sm font-medium">
            <TrendingUp className="h-4 w-4 mr-2" />
            Trusted by Healthcare Professionals
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Proven Results in Healthcare Innovation
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of healthcare professionals who trust MedScribe for their daily practice
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -5, scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="text-center space-y-4 p-6 rounded-2xl bg-background border border-border/50 hover:border-border hover:shadow-lg transition-all duration-300"
            >
              <motion.div
                className="flex justify-center"
                whileHover={{ rotate: 5 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <stat.icon className="h-8 w-8 text-primary" />
                </div>
              </motion.div>
              <div className="space-y-2">
                <motion.div
                  className="text-3xl font-bold text-foreground"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + index * 0.1, type: "spring", stiffness: 200 }}
                >
                  {stat.value}
                </motion.div>
                <div className="text-lg font-semibold text-foreground">{stat.label}</div>
                <div className="text-sm text-muted-foreground">{stat.description}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Enhanced Trust Indicators */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-muted-foreground">
            {[
              { label: "SOC 2 Compliant" },
              { label: "ISO 27001 Certified" },
              { label: "GDPR Compliant" },
              { label: "FDA Guidelines" }
            ].map((item, index) => (
              <motion.div
                key={index}
                className="flex items-center gap-2"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 1 + index * 0.1 }}
              >
                <motion.div
                  className="w-2 h-2 bg-primary rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                />
                <span>{item.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
