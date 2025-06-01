"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Search, 
  Stethoscope, 
  CheckCircle, 
  Loader2,
  UserCheck,
  Star
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ShareSOAPDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  soapNoteId: string;
  onSuccess?: () => void;
}

export function ShareSOAPDialog({ 
  open, 
  onOpenChange, 
  soapNoteId, 
  onSuccess 
}: ShareSOAPDialogProps) {
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSharing, setIsSharing] = useState(false);

  // Get all active doctors
  const doctors = useQuery(api.doctors.getAllActiveDoctors);
  
  // Share SOAP note mutation
  const shareSOAPNote = useMutation(api.sharedSoapNotes.shareSOAPNote);

  // Filter doctors based on search term
  const filteredDoctors = doctors?.filter(doctor => 
    doctor.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleShare = async () => {
    if (!selectedDoctorId) {
      toast.error("Please select a doctor to share with");
      return;
    }

    setIsSharing(true);
    try {
      await shareSOAPNote({
        soapNoteId: soapNoteId as any,
        doctorId: selectedDoctorId as any,
        message: message.trim() || undefined,
      });

      toast.success("SOAP note shared successfully!");
      onOpenChange(false);
      onSuccess?.();
      
      // Reset form
      setSelectedDoctorId("");
      setMessage("");
      setSearchTerm("");
    } catch (error) {
      console.error("Error sharing SOAP note:", error);
      toast.error("Failed to share SOAP note. Please try again.");
    } finally {
      setIsSharing(false);
    }
  };

  const selectedDoctor = doctors?.find(d => d._id === selectedDoctorId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Share SOAP Note with Doctor
          </DialogTitle>
          <DialogDescription>
            Select a doctor to share your SOAP note with. They will be able to view and review your medical notes.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-4 min-h-0">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search">Search Doctors</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search by name or specialization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Doctor Selection */}
          <div className="space-y-2">
            <Label>Select Doctor</Label>
            <ScrollArea className="h-64 border rounded-lg p-2">
              {filteredDoctors.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {doctors === undefined ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading doctors...
                    </div>
                  ) : (
                    "No doctors found"
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredDoctors.map((doctor) => (
                    <Card 
                      key={doctor._id}
                      className={cn(
                        "cursor-pointer transition-all hover:shadow-md",
                        selectedDoctorId === doctor._id 
                          ? "ring-2 ring-primary bg-primary/5" 
                          : "hover:bg-muted/50"
                      )}
                      onClick={() => setSelectedDoctorId(doctor._id)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={doctor.profileImageUrl} />
                            <AvatarFallback>
                              {doctor.firstName[0]}{doctor.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">
                                Dr. {doctor.firstName} {doctor.lastName}
                              </h4>
                              {selectedDoctorId === doctor._id && (
                                <CheckCircle className="h-4 w-4 text-primary" />
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                <Stethoscope className="h-3 w-3 mr-1" />
                                {doctor.specialization}
                              </Badge>
                              {doctor.experienceYears && (
                                <Badge variant="outline" className="text-xs">
                                  {doctor.experienceYears} years exp.
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Add a message for the doctor..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Selected Doctor Summary */}
          {selectedDoctor && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={selectedDoctor.profileImageUrl} />
                    <AvatarFallback className="text-xs">
                      {selectedDoctor.firstName[0]}{selectedDoctor.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">
                      Sharing with Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {selectedDoctor.specialization}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleShare} 
            disabled={!selectedDoctorId || isSharing}
          >
            {isSharing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sharing...
              </>
            ) : (
              <>
                <UserCheck className="h-4 w-4 mr-2" />
                Share SOAP Note
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
