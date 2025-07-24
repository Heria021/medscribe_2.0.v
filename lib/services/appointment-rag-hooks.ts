/**
 * Production-Ready Appointment RAG Integration Hooks
 * 
 * Provides clean, non-blocking RAG embedding for appointment lifecycle events.
 * Designed for production use with proper error handling and configuration.
 */

import { embedDoctorData, embedPatientData } from './rag-api';

/**
 * Configuration for RAG embedding behavior
 */
interface RAGConfig {
  enabled: boolean;
  async: boolean;
  retryOnFailure: boolean;
  logErrors: boolean;
  timeout: number;
}

const DEFAULT_CONFIG: RAGConfig = {
  enabled: process.env.NODE_ENV !== 'test' && typeof window !== 'undefined',
  async: true,
  retryOnFailure: true,
  logErrors: false, // Clean production logging
  timeout: 5000, // 5 second timeout
};

/**
 * Appointment data structure for RAG embedding
 */
export interface AppointmentEventData {
  appointmentId: string;
  doctorId: string;
  patientId: string;
  appointmentDateTime: number;
  appointmentType: string;
  visitReason: string;
  location: {
    type: 'in_person' | 'telemedicine';
    address?: string;
    room?: string;
    meetingLink?: string;
  };
  notes?: string;
  // Enhanced with patient and doctor names for better RAG embedding
  patientName?: string;
  doctorName?: string;
}

/**
 * Metadata for scheduled appointments
 */
export interface ScheduledMetadata {
  scheduledBy: 'doctor' | 'patient' | 'admin';
  bookingMethod: 'online' | 'phone' | 'in_person';
  insuranceVerified?: boolean;
  copayAmount?: number;
  timeSlotId?: string;
}

/**
 * Production-ready RAG embedding service
 */
class AppointmentRAGService {
  private config: RAGConfig;

  constructor(config: Partial<RAGConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Execute embedding with comprehensive error handling
   */
  private async executeEmbed(
    embedFn: () => Promise<void>,
    eventType: string,
    appointmentId: string
  ): Promise<void> {
    if (!this.config.enabled) {
      return;
    }

    const execute = async () => {
      try {
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('RAG embedding timeout')), this.config.timeout);
        });

        await Promise.race([embedFn(), timeoutPromise]);

        if (this.config.logErrors) {
          console.log(`✅ RAG embed: ${eventType} (${appointmentId})`);
        }
      } catch (error) {
        if (this.config.logErrors) {
          console.warn(`⚠️ RAG embed failed: ${eventType} (${appointmentId})`, error);
        }

        // Retry logic
        if (this.config.retryOnFailure) {
          setTimeout(async () => {
            try {
              const retryTimeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('RAG embedding retry timeout')), this.config.timeout);
              });
              await Promise.race([embedFn(), retryTimeoutPromise]);
              if (this.config.logErrors) {
                console.log(`✅ RAG embed retry: ${eventType} (${appointmentId})`);
              }
            } catch (retryError) {
              if (this.config.logErrors) {
                console.warn(`⚠️ RAG embed retry failed: ${eventType} (${appointmentId})`);
              }
            }
          }, 2000);
        }
      }
    };

    if (this.config.async) {
      // Non-blocking execution
      execute().catch(() => {}); // Silently handle async errors
    } else {
      await execute();
    }
  }

  /**
   * Embed appointment scheduled event
   */
  async onAppointmentScheduled(
    appointmentData: AppointmentEventData,
    metadata: ScheduledMetadata
  ): Promise<void> {
    await this.executeEmbed(
      async () => {
        const date = new Date(appointmentData.appointmentDateTime).toLocaleDateString();
        const time = new Date(appointmentData.appointmentDateTime).toLocaleTimeString();
        
        // Enhanced data with patient and doctor names
        const patientName = appointmentData.patientName || 'patient';
        const doctorName = appointmentData.doctorName || 'doctor';



        // Enhanced data format matching your exact specification
        const locationText = appointmentData.location.type === 'in_person'
          ? `in_person${appointmentData.location.room ? ` at ${appointmentData.location.room}` : ''}${appointmentData.location.address ? ` (${appointmentData.location.address})` : ''}`
          : `telemedicine${appointmentData.location.meetingLink ? ` via ${appointmentData.location.meetingLink}` : ''}`;

        const instructionsText = appointmentData.notes ? ` ${appointmentData.notes}` : '';

        const doctorData = `Appointment scheduled with patient ${patientName} for ${appointmentData.visitReason}. Date: ${date} at ${time}. Type: ${appointmentData.appointmentType}. Location: ${locationText}.${instructionsText}`;

        const patientData = `Appointment scheduled for ${appointmentData.visitReason} with Dr. ${doctorName}. Date: ${date} at ${time}. Type: ${appointmentData.appointmentType}. Location: ${locationText}.${instructionsText}`;



        // Enhanced metadata matching your exact specification
        const commonMetadata = {
          appointment_id: appointmentData.appointmentId,
          appointment_date: date,
          appointment_time: time,
          appointment_type: appointmentData.appointmentType,
          visit_reason: appointmentData.visitReason,
          location_type: appointmentData.location.type,
          patient_name: patientName,
          doctor_name: doctorName,
          scheduled_by: metadata.scheduledBy,
          booking_method: metadata.bookingMethod,
          insurance_verified: metadata.insuranceVerified,
          copay_amount: metadata.copayAmount,
          time_slot_id: metadata.timeSlotId
        };

        await Promise.all([
          embedDoctorData(
            appointmentData.doctorId,
            'appointment_scheduled',
            doctorData,
            { ...commonMetadata, patient_id: appointmentData.patientId }
          ),
          embedPatientData(
            appointmentData.patientId,
            'appointment_scheduled',
            patientData,
            { ...commonMetadata, doctor_id: appointmentData.doctorId }
          )
        ]);
      },
      'appointment_scheduled',
      appointmentData.appointmentId
    );
  }

  /**
   * Embed appointment cancelled event
   */
  async onAppointmentCancelled(
    appointmentData: AppointmentEventData,
    reason: string,
    cancelledBy: 'doctor' | 'patient' | 'admin'
  ): Promise<void> {
    await this.executeEmbed(
      async () => {
        const date = new Date(appointmentData.appointmentDateTime).toLocaleDateString();
        const time = new Date(appointmentData.appointmentDateTime).toLocaleTimeString();
        
        // Enhanced data with patient and doctor names
        const patientName = appointmentData.patientName || 'patient';
        const doctorName = appointmentData.doctorName || 'doctor';

        const doctorData = `Appointment cancelled with patient ${patientName} for ${date} at ${time}. Reason: ${reason}. Patient visit: ${appointmentData.visitReason}`;
        const patientData = `Appointment cancelled with Dr. ${doctorName} for ${date} at ${time}. Reason: ${reason}. Visit: ${appointmentData.visitReason}`;

        const metadata = {
          appointment_id: appointmentData.appointmentId,
          appointment_date: date,
          appointment_time: time,
          appointment_type: appointmentData.appointmentType,
          visit_reason: appointmentData.visitReason,
          patient_name: patientName,
          doctor_name: doctorName,
          reason,
          cancelled_by: cancelledBy
        };

        await Promise.all([
          embedDoctorData(
            appointmentData.doctorId,
            'appointment_cancelled',
            doctorData,
            { ...metadata, patient_id: appointmentData.patientId }
          ),
          embedPatientData(
            appointmentData.patientId,
            'appointment_cancelled',
            patientData,
            { ...metadata, doctor_id: appointmentData.doctorId }
          )
        ]);
      },
      'appointment_cancelled',
      appointmentData.appointmentId
    );
  }

  /**
   * Embed appointment confirmed event
   */
  async onAppointmentConfirmed(
    appointmentData: AppointmentEventData,
    confirmedBy: 'doctor' | 'patient' | 'admin' = 'doctor'
  ): Promise<void> {
    await this.executeEmbed(
      async () => {
        const date = new Date(appointmentData.appointmentDateTime).toLocaleDateString();
        const time = new Date(appointmentData.appointmentDateTime).toLocaleTimeString();
        
        // Enhanced data with patient and doctor names
        const patientName = appointmentData.patientName || 'patient';
        const doctorName = appointmentData.doctorName || 'doctor';

        const doctorData = `Appointment confirmed with patient ${patientName} for ${date} at ${time}. Patient visit: ${appointmentData.visitReason}`;
        const patientData = `Appointment confirmed with Dr. ${doctorName} for ${date} at ${time}. Visit: ${appointmentData.visitReason}`;

        const metadata = {
          appointment_id: appointmentData.appointmentId,
          appointment_date: date,
          appointment_time: time,
          appointment_type: appointmentData.appointmentType,
          visit_reason: appointmentData.visitReason,
          patient_name: patientName,
          doctor_name: doctorName,
          confirmed_by: confirmedBy
        };

        await Promise.all([
          embedDoctorData(
            appointmentData.doctorId,
            'appointment_confirmed',
            doctorData,
            { ...metadata, patient_id: appointmentData.patientId }
          ),
          embedPatientData(
            appointmentData.patientId,
            'appointment_confirmed',
            patientData,
            { ...metadata, doctor_id: appointmentData.doctorId }
          )
        ]);
      },
      'appointment_confirmed',
      appointmentData.appointmentId
    );
  }

  /**
   * Embed appointment completed event
   */
  async onAppointmentCompleted(
    appointmentData: AppointmentEventData,
    duration?: number,
    notes?: string
  ): Promise<void> {
    await this.executeEmbed(
      async () => {
        const date = new Date(appointmentData.appointmentDateTime).toLocaleDateString();
        const durationText = duration ? ` Duration: ${duration} minutes.` : '';
        const notesText = notes ? ` Notes: ${notes}` : '';
        
        // Enhanced data with patient and doctor names
        const patientName = appointmentData.patientName || 'patient';
        const doctorName = appointmentData.doctorName || 'doctor';

        const doctorData = `Appointment completed with patient ${patientName} for ${appointmentData.visitReason}. Date: ${date}.${durationText}${notesText}`;
        const patientData = `Appointment completed with Dr. ${doctorName} for ${appointmentData.visitReason}. Date: ${date}.${durationText}`;

        const metadata = {
          appointment_id: appointmentData.appointmentId,
          appointment_date: date,
          appointment_type: appointmentData.appointmentType,
          visit_reason: appointmentData.visitReason,
          patient_name: patientName,
          doctor_name: doctorName,
          duration,
          completion_notes: notes
        };

        await Promise.all([
          embedDoctorData(
            appointmentData.doctorId,
            'appointment_completed',
            doctorData,
            { ...metadata, patient_id: appointmentData.patientId }
          ),
          embedPatientData(
            appointmentData.patientId,
            'appointment_completed',
            patientData,
            { ...metadata, doctor_id: appointmentData.doctorId }
          )
        ]);
      },
      'appointment_completed',
      appointmentData.appointmentId
    );
  }
}

// Singleton instance for production use
export const appointmentRAGHooks = new AppointmentRAGService();

// Convenience exports
export const {
  onAppointmentScheduled,
  onAppointmentCancelled,
  onAppointmentConfirmed,
  onAppointmentCompleted
} = appointmentRAGHooks;
