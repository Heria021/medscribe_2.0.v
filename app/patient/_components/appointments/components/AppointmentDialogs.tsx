"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { CancelDialogProps, RescheduleDialogProps } from "../types";

/**
 * Cancel appointment dialog component
 * 
 * Features:
 * - Confirmation dialog for canceling appointments
 * - Loading state support
 * - Accessible design
 * - Customizable content
 * 
 * @param props - CancelDialogProps
 * @returns JSX.Element
 */
export const CancelDialog = React.memo<CancelDialogProps>(({
  open,
  onOpenChange,
  appointmentId,
  appointment,
  onConfirm,
  isLoading = false,
}) => {
  const handleConfirm = React.useCallback(async () => {
    if (!appointmentId) return;
    
    try {
      await onConfirm(appointmentId, "Cancelled by patient");
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in the hook
      console.error("Failed to cancel appointment:", error);
    }
  }, [appointmentId, onConfirm, onOpenChange]);

  const handleCancel = React.useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel Appointment</DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel this appointment? This action cannot be undone.
            {appointment && (
              <div className="mt-2 p-2 bg-muted rounded text-sm">
                <strong>Appointment Details:</strong><br />
                {appointment.doctor && `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`}<br />
                {new Date(appointment.appointmentDateTime).toLocaleString()}
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Keep Appointment
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading || !appointmentId}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Cancel Appointment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

CancelDialog.displayName = "CancelDialog";

/**
 * Reschedule appointment dialog component
 * 
 * Features:
 * - Information dialog for rescheduling appointments
 * - Redirects to booking page
 * - Loading state support
 * - Accessible design
 * 
 * @param props - RescheduleDialogProps
 * @returns JSX.Element
 */
export const RescheduleDialog = React.memo<RescheduleDialogProps>(({
  open,
  onOpenChange,
  appointmentId,
  appointment,
  onConfirm,
  isLoading = false,
}) => {
  const handleClose = React.useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const handleBookNew = React.useCallback(() => {
    // Navigate to booking page
    window.location.href = '/patient/appointments/book';
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reschedule Appointment</DialogTitle>
          <DialogDescription>
            Contact your healthcare provider to reschedule this appointment, or book a new appointment.
            {appointment && (
              <div className="mt-2 p-2 bg-muted rounded text-sm">
                <strong>Current Appointment:</strong><br />
                {appointment.doctor && `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`}<br />
                {new Date(appointment.appointmentDateTime).toLocaleString()}
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Close
          </Button>
          <Button
            onClick={handleBookNew}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Book New Appointment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

RescheduleDialog.displayName = "RescheduleDialog";

/**
 * Generic confirmation dialog component
 * 
 * @param props - Confirmation dialog props
 * @returns JSX.Element
 */
interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  isLoading?: boolean;
  variant?: "default" | "destructive";
}

export const ConfirmationDialog = React.memo<ConfirmationDialogProps>(({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  isLoading = false,
  variant = "default",
}) => {
  const handleConfirm = React.useCallback(async () => {
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      console.error("Confirmation action failed:", error);
    }
  }, [onConfirm, onOpenChange]);

  const handleCancel = React.useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            variant={variant}
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

ConfirmationDialog.displayName = "ConfirmationDialog";
