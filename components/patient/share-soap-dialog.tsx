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
  Star,
  X
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
    doctor.primarySpecialty.toLowerCase().includes(searchTerm.toLowerCase())
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
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col backdrop-blur-xl">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <UserCheck className="h-4 w-4 text-primary" />
            </div>
            Share SOAP Note
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Select a doctor to share your SOAP note with for review and collaboration.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-4 min-h-0">
          {/* Sleek Search */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Find Doctor</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or specialty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-10 bg-background/50 border-muted-foreground/20 focus:border-primary/50 transition-all"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 rounded-full hover:bg-muted"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>

          {/* Compact Doctor List */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Available Doctors</Label>
            <ScrollArea className="h-64 rounded-xl border border-muted-foreground/10 bg-muted/20">
              {filteredDoctors.length === 0 ? (
                <div className="flex items-center justify-center h-full text-center p-6">
                  {doctors === undefined ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Loading doctors...</span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">No doctors found</span>
                  )}
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {filteredDoctors.map((doctor) => (
                    <Card 
                      key={doctor._id}
                      className={cn(
                        "cursor-pointer transition-all duration-200 border-0 shadow-none hover:shadow-sm",
                        selectedDoctorId === doctor._id 
                          ? "bg-primary/5 ring-1 ring-primary/30" 
                          : "hover:bg-muted/50"
                      )}
                      onClick={() => setSelectedDoctorId(doctor._id)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 ring-1 ring-border">
                            <AvatarImage src={doctor.profileImageUrl} />
                            <AvatarFallback className="bg-gradient-to-br from-primary/80 to-primary text-primary-foreground text-sm font-medium">
                              {doctor.firstName[0]}{doctor.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-sm truncate">
                                Dr. {doctor.firstName} {doctor.lastName}
                              </h4>
                              {selectedDoctorId === doctor._id && (
                                <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs h-5 px-2 bg-primary/10 text-primary">
                                <Stethoscope className="h-3 w-3 mr-1" />
                                {doctor.primarySpecialty}
                              </Badge>
                              {doctor.yearsOfExperience && (
                                <Badge variant="outline" className="text-xs h-5 px-2 border-muted-foreground/30">
                                  {doctor.yearsOfExperience}y exp
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

          {/* Sleek Message Input */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Message (Optional)</Label>
            <Textarea
              placeholder="Add a note for the doctor..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="resize-none bg-background/50 border-muted-foreground/20 focus:border-primary/50 transition-all"
            />
          </div>

          {/* Compact Selected Doctor */}
          {selectedDoctor && (
            <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={selectedDoctor.profileImageUrl} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {selectedDoctor.firstName[0]}{selectedDoctor.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selectedDoctor.primarySpecialty}
                  </p>
                </div>
                <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="pt-4 gap-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="px-4"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleShare} 
            disabled={!selectedDoctorId || isSharing}
            className="px-6 bg-primary hover:bg-primary/90"
          >
            {isSharing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sharing...
              </>
            ) : (
              <>
                <UserCheck className="h-4 w-4 mr-2" />
                Share Note
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}