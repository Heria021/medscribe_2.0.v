"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Star, Quote, Stethoscope, UserCheck } from "lucide-react";

export function TestimonialsSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50, rotateX: -15 },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const testimonials = [
    {
      role: "doctor",
      name: "Dr. Sarah Chen",
      title: "Internal Medicine Physician",
      location: "San Francisco, CA",
      rating: 5,
      quote: "MedScribe has revolutionized my practice. The AI-powered SOAP generation saves me 3+ hours daily, and the accuracy is remarkable. My patients love the seamless communication features.",
      avatar: "SC"
    },
    {
      role: "patient",
      name: "Michael Rodriguez",
      title: "Patient",
      location: "Austin, TX",
      rating: 5,
      quote: "Finally, a healthcare platform that puts patients first. The AI assistant helps me understand my conditions better, and I can easily track my treatment progress. Game-changer!",
      avatar: "MR"
    },
    {
      role: "doctor",
      name: "Dr. James Wilson",
      title: "Family Medicine",
      location: "Chicago, IL",
      rating: 5,
      quote: "The voice-to-text feature is incredibly accurate with medical terminology. Patient management has never been easier, and the clinical insights help me provide better care.",
      avatar: "JW"
    },
    {
      role: "patient",
      name: "Emily Thompson",
      title: "Patient",
      location: "Seattle, WA",
      rating: 5,
      quote: "I love how I can record my symptoms and get professional SOAP notes instantly. The AI assistant is like having a medical expert available 24/7. Highly recommend!",
      avatar: "ET"
    },
    {
      role: "doctor",
      name: "Dr. Maria Garcia",
      title: "Pediatrician",
      location: "Miami, FL",
      rating: 5,
      quote: "MedScribe's patient communication tools have strengthened my relationships with families. The automated scheduling and reminders have reduced no-shows by 40%.",
      avatar: "MG"
    },
    {
      role: "patient",
      name: "David Kim",
      title: "Patient",
      location: "Los Angeles, CA",
      rating: 5,
      quote: "The treatment tracking features help me stay on top of my medications and appointments. The secure messaging with my doctor gives me peace of mind.",
      avatar: "DK"
    }
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          className="text-center space-y-6 mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Badge variant="outline" className="px-4 py-2 text-sm font-medium">
            <Star className="h-4 w-4 mr-2" />
            Trusted by Healthcare Professionals & Patients
          </Badge>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
            What Our Users Say
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Real feedback from doctors and patients who use MedScribe daily
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="relative overflow-hidden border-border/50 hover:border-border hover:shadow-xl transition-all duration-500 bg-background/80 backdrop-blur-sm h-full">
                <CardContent className="p-6">
                  {/* Animated Quote Icon */}
                  <motion.div
                    className="absolute top-4 right-4 opacity-10"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Quote className="h-8 w-8" />
                  </motion.div>

                  {/* Animated Rating */}
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0, rotate: -180 }}
                        whileInView={{ scale: 1, rotate: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 + i * 0.1, type: "spring" }}
                      >
                        <Star className="h-4 w-4 fill-primary text-primary" />
                      </motion.div>
                    ))}
                  </div>

                  {/* Quote */}
                  <blockquote className="text-muted-foreground mb-6 leading-relaxed">
                    "{testimonial.quote}"
                  </blockquote>

                  {/* Author */}
                  <div className="flex items-center gap-3">
                    <motion.div
                      className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <span className="text-sm font-semibold text-primary">
                        {testimonial.avatar}
                      </span>
                    </motion.div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                        <motion.div
                          whileHover={{ scale: 1.2 }}
                          transition={{ type: "spring", stiffness: 400 }}
                        >
                          {testimonial.role === "doctor" ? (
                            <Stethoscope className="h-4 w-4 text-primary" />
                          ) : (
                            <UserCheck className="h-4 w-4 text-primary" />
                          )}
                        </motion.div>
                      </div>
                      <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.location}</p>
                    </div>
                  </div>

                  {/* Role Badge */}
                  <div className="mt-4">
                    <Badge variant="secondary" className="text-xs bg-muted text-muted-foreground">
                      {testimonial.role === "doctor" ? "Healthcare Provider" : "Patient"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-muted-foreground">
            <motion.div
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 1 }}
            >
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, rotate: -180 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 1.1 + i * 0.1, type: "spring" }}
                  >
                    <Star className="h-4 w-4 fill-primary text-primary" />
                  </motion.div>
                ))}
              </div>
              <span className="font-medium">4.9/5 Average Rating</span>
            </motion.div>

            {[
              "98% User Satisfaction",
              "50+ Healthcare Facilities"
            ].map((item, index) => (
              <motion.div
                key={index}
                className="flex items-center gap-2"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 1.2 + index * 0.1 }}
              >
                <motion.div
                  className="w-2 h-2 bg-primary rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                />
                <span>{item}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
