"use client";

import { Badge } from "@/components/ui/badge";
import { Stethoscope, Mail, Phone, MapPin, Globe } from "lucide-react";
import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/40 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                <Stethoscope className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold">MedScribe</span>
                <span className="text-xs text-muted-foreground font-medium">v2.0</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              AI-powered medical platform transforming healthcare through intelligent automation, 
              voice-powered documentation, and patient-centered care.
            </p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-xs text-muted-foreground">System Online</span>
              <Badge variant="secondary" className="text-xs ml-2">
                v2.0
              </Badge>
            </div>
          </div>

          {/* For Patients */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">For Patients</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link href="/for-patients" className="hover:text-foreground transition-colors">
                  Patient Platform Overview
                </Link>
              </li>
              <li>
                <Link href="/auth/select-role" className="hover:text-foreground transition-colors">
                  Voice-Powered SOAP Notes
                </Link>
              </li>
              <li>
                <Link href="/auth/select-role" className="hover:text-foreground transition-colors">
                  AI Health Assistant
                </Link>
              </li>
              <li>
                <Link href="/auth/select-role" className="hover:text-foreground transition-colors">
                  Appointment Booking
                </Link>
              </li>
              <li>
                <Link href="/auth/select-role" className="hover:text-foreground transition-colors">
                  Treatment Tracking
                </Link>
              </li>
              <li>
                <Link href="/auth/select-role" className="hover:text-foreground transition-colors">
                  Secure Messaging
                </Link>
              </li>
            </ul>
          </div>

          {/* For Doctors */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">For Doctors</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link href="/for-doctors" className="hover:text-foreground transition-colors">
                  Doctor Platform Overview
                </Link>
              </li>
              <li>
                <Link href="/auth/select-role" className="hover:text-foreground transition-colors">
                  Patient Management
                </Link>
              </li>
              <li>
                <Link href="/auth/select-role" className="hover:text-foreground transition-colors">
                  AI Documentation
                </Link>
              </li>
              <li>
                <Link href="/auth/select-role" className="hover:text-foreground transition-colors">
                  Clinical AI Assistant
                </Link>
              </li>
              <li>
                <Link href="/auth/select-role" className="hover:text-foreground transition-colors">
                  E-Prescribing
                </Link>
              </li>
              <li>
                <Link href="/auth/select-role" className="hover:text-foreground transition-colors">
                  Schedule Management
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform & Support */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Platform</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span>Security & Privacy</span>
              </li>
              <li className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span>HIPAA Compliance</span>
              </li>
              <li className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span>API Documentation</span>
              </li>
              <li className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span>Integration Guide</span>
              </li>
            </ul>

            {/* Contact Info */}
            <div className="space-y-2 pt-4">
              <h4 className="font-medium text-foreground text-sm">Contact</h4>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Mail className="h-3 w-3" />
                  <span>support@medscribe.ai</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-3 w-3" />
                  <span>1-800-MEDSCRIBE</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-3 w-3" />
                  <span>24/7 Support Available</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border/40 mt-12 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              © {currentYear} MedScribe 2.0. All rights reserved.
            </div>
            
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="#" className="hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors">
                Terms of Service
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors">
                HIPAA Notice
              </Link>
            </div>
          </div>

          {/* Compliance Badges */}
          <div className="flex flex-wrap justify-center items-center gap-6 mt-8 pt-6 border-t border-border/20">
            {[
              "SOC 2 Type II",
              "ISO 27001",
              "GDPR Compliant",
              "FDA Guidelines",
              "HIPAA Compliant"
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
