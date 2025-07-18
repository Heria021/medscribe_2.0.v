/**
 * Production-Ready SOAP Notes RAG Integration Hooks
 * 
 * Provides clean, non-blocking RAG embedding for SOAP note events:
 * - SOAP note generation/creation
 * - SOAP note sharing between doctors
 * - SOAP note acceptance/rejection
 * - SOAP note updates/modifications
 * - SOAP note reviews and approvals
 */

import { embedDoctorData, embedPatientData } from './rag-api';

/**
 * Configuration for SOAP RAG embedding
 */
interface SOAPRAGConfig {
  enabled: boolean;
  async: boolean;
  retryOnFailure: boolean;
  logErrors: boolean;
  timeout: number;
}

const DEFAULT_CONFIG: SOAPRAGConfig = {
  enabled: process.env.NODE_ENV !== 'test' && typeof window !== 'undefined',
  async: true,
  retryOnFailure: true,
  logErrors: process.env.NODE_ENV === 'development',
  timeout: 5000,
};

/**
 * SOAP note data structure
 */
export interface SOAPNoteEventData {
  soapNoteId: string;
  doctorId: string;
  patientId: string;
  appointmentId?: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  chiefComplaint?: string;
  vitalSigns?: {
    bloodPressure?: string;
    heartRate?: string;
    temperature?: string;
    respiratoryRate?: string;
    oxygenSaturation?: string;
    weight?: string;
    height?: string;
  };
  diagnosis?: string[];
  medications?: string[];
  followUpInstructions?: string;
  status: 'draft' | 'completed' | 'shared' | 'reviewed';
  createdAt: number;
  updatedAt?: number;
}

/**
 * SOAP sharing data structure
 */
export interface SOAPSharingEventData {
  shareId: string;
  soapNoteId: string;
  fromDoctorId: string;
  toDoctorId: string;
  patientId: string;
  shareReason: string;
  permissions: 'view' | 'edit' | 'comment';
  expiresAt?: number;
  message?: string;
  createdAt: number;
}

/**
 * SOAP action data structure
 */
export interface SOAPActionEventData {
  actionId: string;
  soapNoteId: string;
  doctorId: string;
  patientId: string;
  actionType: 'accepted' | 'rejected' | 'reviewed' | 'commented' | 'updated';
  comments?: string;
  changes?: string;
  reason?: string;
  createdAt: number;
}

/**
 * Production-ready SOAP RAG embedding service
 */
class SOAPRAGService {
  private config: SOAPRAGConfig;

  constructor(config: Partial<SOAPRAGConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Execute embedding with comprehensive error handling
   */
  private async executeEmbed(
    embedFn: () => Promise<void>,
    eventType: string,
    entityId: string
  ): Promise<void> {
    if (!this.config.enabled) {
      return;
    }

    const execute = async () => {
      try {
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('SOAP RAG embedding timeout')), this.config.timeout);
        });

        await Promise.race([embedFn(), timeoutPromise]);

        if (this.config.logErrors) {
          console.log(`✅ SOAP RAG embed: ${eventType} (${entityId})`);
        }
      } catch (error) {
        if (this.config.logErrors) {
          console.warn(`⚠️ SOAP RAG embed failed: ${eventType} (${entityId})`, error);
        }

        if (this.config.retryOnFailure) {
          setTimeout(async () => {
            try {
              await Promise.race([embedFn(), timeoutPromise]);
              if (this.config.logErrors) {
                console.log(`✅ SOAP RAG embed retry: ${eventType} (${entityId})`);
              }
            } catch (retryError) {
              if (this.config.logErrors) {
                console.warn(`⚠️ SOAP RAG embed retry failed: ${eventType} (${entityId})`);
              }
            }
          }, 2000);
        }
      }
    };

    if (this.config.async) {
      execute().catch(() => {});
    } else {
      await execute();
    }
  }

  /**
   * Embed SOAP note created/generated event
   */
  async onSOAPNoteCreated(soapData: SOAPNoteEventData): Promise<void> {
    await this.executeEmbed(
      async () => {
        const date = new Date(soapData.createdAt).toLocaleDateString();
        const diagnosisText = soapData.diagnosis?.length ? ` Diagnosis: ${soapData.diagnosis.join(', ')}` : '';
        const medicationsText = soapData.medications?.length ? ` Medications: ${soapData.medications.join(', ')}` : '';
        const vitalSignsText = soapData.vitalSigns ? ` Vitals: BP ${soapData.vitalSigns.bloodPressure || 'N/A'}, HR ${soapData.vitalSigns.heartRate || 'N/A'}` : '';
        const followUpText = soapData.followUpInstructions ? ` Follow-up: ${soapData.followUpInstructions}` : '';
        
        const doctorData = `SOAP note created for patient visit on ${date}. Chief complaint: ${soapData.chiefComplaint || 'Not specified'}. Subjective: ${soapData.subjective}. Objective: ${soapData.objective}. Assessment: ${soapData.assessment}. Plan: ${soapData.plan}.${diagnosisText}${medicationsText}${vitalSignsText}${followUpText}`;
        
        const patientData = `Medical visit documented on ${date}. Chief complaint: ${soapData.chiefComplaint || 'Not specified'}. Assessment: ${soapData.assessment}. Treatment plan: ${soapData.plan}.${diagnosisText}${followUpText}`;
        
        const metadata = {
          soap_note_id: soapData.soapNoteId,
          appointment_id: soapData.appointmentId,
          chief_complaint: soapData.chiefComplaint,
          diagnosis: soapData.diagnosis,
          medications: soapData.medications,
          vital_signs: soapData.vitalSigns,
          status: soapData.status,
          created_date: date
        };

        await Promise.all([
          embedDoctorData(
            soapData.doctorId,
            'soap_note_created',
            doctorData,
            { ...metadata, patient_id: soapData.patientId }
          ),
          embedPatientData(
            soapData.patientId,
            'soap_note_created',
            patientData,
            { ...metadata, doctor_id: soapData.doctorId }
          )
        ]);
      },
      'soap_note_created',
      soapData.soapNoteId
    );
  }

  /**
   * Embed SOAP note shared event
   */
  async onSOAPNoteShared(sharingData: SOAPSharingEventData, soapData?: Partial<SOAPNoteEventData>): Promise<void> {
    await this.executeEmbed(
      async () => {
        const date = new Date(sharingData.createdAt).toLocaleDateString();
        const expiryText = sharingData.expiresAt ? ` Expires: ${new Date(sharingData.expiresAt).toLocaleDateString()}` : '';
        const messageText = sharingData.message ? ` Message: ${sharingData.message}` : '';
        
        const fromDoctorData = `SOAP note shared with colleague on ${date}. Patient case shared for: ${sharingData.shareReason}. Permissions: ${sharingData.permissions}.${expiryText}${messageText}`;
        
        const toDoctorData = `SOAP note received from colleague on ${date}. Patient case shared for: ${sharingData.shareReason}. Permissions: ${sharingData.permissions}.${expiryText}${messageText}`;
        
        const patientData = `Medical records shared between healthcare providers on ${date} for: ${sharingData.shareReason}`;
        
        const metadata = {
          share_id: sharingData.shareId,
          soap_note_id: sharingData.soapNoteId,
          from_doctor_id: sharingData.fromDoctorId,
          to_doctor_id: sharingData.toDoctorId,
          share_reason: sharingData.shareReason,
          permissions: sharingData.permissions,
          expires_at: sharingData.expiresAt ? new Date(sharingData.expiresAt).toLocaleDateString() : undefined,
          shared_date: date
        };

        await Promise.all([
          embedDoctorData(
            sharingData.fromDoctorId,
            'soap_note_shared_out',
            fromDoctorData,
            { ...metadata, patient_id: sharingData.patientId }
          ),
          embedDoctorData(
            sharingData.toDoctorId,
            'soap_note_shared_in',
            toDoctorData,
            { ...metadata, patient_id: sharingData.patientId }
          ),
          embedPatientData(
            sharingData.patientId,
            'soap_note_shared',
            patientData,
            { ...metadata, from_doctor_id: sharingData.fromDoctorId, to_doctor_id: sharingData.toDoctorId }
          )
        ]);
      },
      'soap_note_shared',
      sharingData.shareId
    );
  }

  /**
   * Embed SOAP note action event (accepted, rejected, reviewed, etc.)
   */
  async onSOAPNoteAction(actionData: SOAPActionEventData, soapData?: Partial<SOAPNoteEventData>): Promise<void> {
    await this.executeEmbed(
      async () => {
        const date = new Date(actionData.createdAt).toLocaleDateString();
        const commentsText = actionData.comments ? ` Comments: ${actionData.comments}` : '';
        const changesText = actionData.changes ? ` Changes: ${actionData.changes}` : '';
        const reasonText = actionData.reason ? ` Reason: ${actionData.reason}` : '';
        
        const doctorData = `SOAP note ${actionData.actionType} on ${date}.${commentsText}${changesText}${reasonText}`;
        
        const patientData = `Medical record ${actionData.actionType} by healthcare provider on ${date}.${reasonText}`;
        
        const metadata = {
          action_id: actionData.actionId,
          soap_note_id: actionData.soapNoteId,
          action_type: actionData.actionType,
          comments: actionData.comments,
          changes: actionData.changes,
          reason: actionData.reason,
          action_date: date
        };

        await Promise.all([
          embedDoctorData(
            actionData.doctorId,
            `soap_note_${actionData.actionType}`,
            doctorData,
            { ...metadata, patient_id: actionData.patientId }
          ),
          embedPatientData(
            actionData.patientId,
            `soap_note_${actionData.actionType}`,
            patientData,
            { ...metadata, doctor_id: actionData.doctorId }
          )
        ]);
      },
      `soap_note_${actionData.actionType}`,
      actionData.actionId
    );
  }

  /**
   * Embed SOAP note updated event
   */
  async onSOAPNoteUpdated(soapData: SOAPNoteEventData, changes: string): Promise<void> {
    await this.executeEmbed(
      async () => {
        const date = new Date(soapData.updatedAt || soapData.createdAt).toLocaleDateString();
        
        const doctorData = `SOAP note updated on ${date}. Changes: ${changes}. Current assessment: ${soapData.assessment}. Current plan: ${soapData.plan}`;
        
        const patientData = `Medical record updated on ${date}. Updated assessment: ${soapData.assessment}. Updated treatment plan: ${soapData.plan}`;
        
        const metadata = {
          soap_note_id: soapData.soapNoteId,
          appointment_id: soapData.appointmentId,
          changes,
          status: soapData.status,
          updated_date: date
        };

        await Promise.all([
          embedDoctorData(
            soapData.doctorId,
            'soap_note_updated',
            doctorData,
            { ...metadata, patient_id: soapData.patientId }
          ),
          embedPatientData(
            soapData.patientId,
            'soap_note_updated',
            patientData,
            { ...metadata, doctor_id: soapData.doctorId }
          )
        ]);
      },
      'soap_note_updated',
      soapData.soapNoteId
    );
  }
}

// Singleton instance for production use
export const soapRAGHooks = new SOAPRAGService();

// Convenience exports
export const {
  onSOAPNoteCreated,
  onSOAPNoteShared,
  onSOAPNoteAction,
  onSOAPNoteUpdated
} = soapRAGHooks;
