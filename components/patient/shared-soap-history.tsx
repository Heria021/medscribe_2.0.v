"use client";

import React from "react";
import { useQuery } from "convex/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Share, 
  Calendar,
  Stethoscope,
  CheckCircle,
  Clock
} from "lucide-react";
import { api } from "@/convex/_generated/api";

interface SharedSOAPHistoryProps {
  patientId: string;
}

export function SharedSOAPHistory({ patientId }: SharedSOAPHistoryProps) {
  // Get shared SOAP notes by this patient
  const sharedNotes = useQuery(
    api.sharedSoapNotes.getSharedSOAPNotesByPatient,
    patientId ? { patientId: patientId as any } : "skip"
  );

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!sharedNotes || sharedNotes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share className="h-5 w-5" />
            Shared SOAP Notes
          </CardTitle>
          <CardDescription>
            SOAP notes you've shared with doctors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <Share className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No SOAP notes shared yet</p>
            <p className="text-sm">Share your SOAP notes with doctors for review</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share className="h-5 w-5" />
          Shared SOAP Notes
          <Badge variant="secondary" className="ml-auto">
            {sharedNotes.length}
          </Badge>
        </CardTitle>
        <CardDescription>
          SOAP notes you've shared with doctors for review
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {sharedNotes.map((shared) => (
          <div 
            key={shared._id}
            className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={shared.doctor?.profileImageUrl} />
                <AvatarFallback>
                  {shared.doctor?.firstName[0]}{shared.doctor?.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">
                    Dr. {shared.doctor?.firstName} {shared.doctor?.lastName}
                  </h4>
                  <Badge variant="outline" className="text-xs">
                    <Stethoscope className="h-3 w-3 mr-1" />
                    {shared.doctor?.specialization}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>Shared {formatDate(shared.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {shared.isRead ? (
                      <>
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        <span className="text-green-600">Read</span>
                      </>
                    ) : (
                      <>
                        <Clock className="h-3 w-3 text-orange-600" />
                        <span className="text-orange-600">Pending</span>
                      </>
                    )}
                  </div>
                </div>
                {shared.message && (
                  <p className="text-sm text-muted-foreground mt-1 italic">
                    "{shared.message}"
                  </p>
                )}
              </div>
            </div>
            <div className="text-right">
              <Badge 
                variant={shared.isRead ? "secondary" : "default"}
                className="text-xs"
              >
                {shared.isRead ? "Reviewed" : "New"}
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
