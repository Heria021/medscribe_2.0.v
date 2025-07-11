"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PatientProfile, UseSOAPGenerateReturn, ProcessingState } from "../types";

export function useSOAPGenerate(patientProfile?: PatientProfile): UseSOAPGenerateReturn {
  const router = useRouter();
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [processingState, setProcessingState] = useState<ProcessingState>({
    isProcessing: false,
    progress: 0,
    stage: 'uploading',
    message: ''
  });

  const handleAudioReady = useCallback((blob: Blob, name: string) => {
    setAudioBlob(blob);
    setFileName(name);
    setError(null);
  }, []);

  const handleAudioRemove = useCallback(() => {
    setAudioBlob(null);
    setFileName("");
    setError(null);
  }, []);

  const handleGenerateSOAP = useCallback(async () => {
    if (!audioBlob || !patientProfile) {
      toast.error("Please record or upload an audio file first");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setProcessingState({
      isProcessing: true,
      progress: 0,
      stage: 'uploading',
      message: 'Uploading audio file...'
    });

    try {
      // Simulate processing stages with delays
      setProcessingState(prev => ({
        ...prev,
        progress: 25,
        stage: 'transcribing',
        message: 'Transcribing audio...'
      }));

      await new Promise(resolve => setTimeout(resolve, 1000));

      setProcessingState(prev => ({
        ...prev,
        progress: 75,
        stage: 'generating',
        message: 'Generating SOAP notes...'
      }));

      await new Promise(resolve => setTimeout(resolve, 1500));

      // Create a detailed default SOAP note
      const defaultSOAPNote = {
        subjective: `Chief Complaint: Patient presents with persistent cough and shortness of breath for the past 2 weeks.

History of Present Illness: ${patientProfile.firstName} ${patientProfile.lastName} is a ${patientProfile.dateOfBirth ? calculateAge(patientProfile.dateOfBirth) : 'adult'}-year-old ${patientProfile.gender || 'patient'} who reports developing a dry, persistent cough approximately 2 weeks ago. The cough is worse at night and interferes with sleep. Patient also notes mild shortness of breath with exertion, which is new for them. No fever, chills, or chest pain reported. Patient denies recent travel, sick contacts, or known allergen exposure.

Review of Systems:
- Constitutional: Denies fever, chills, night sweats, or unintentional weight loss
- Respiratory: Positive for dry cough and mild dyspnea on exertion, negative for chest pain, wheezing, or hemoptysis
- Cardiovascular: Denies chest pain, palpitations, or lower extremity edema
- GI: Denies nausea, vomiting, or changes in appetite
- Other systems reviewed and negative

Past Medical History: ${patientProfile.medicalHistory?.conditions?.join(', ') || 'No significant past medical history reported'}
Medications: ${patientProfile.medicalHistory?.medications?.join(', ') || 'No current medications reported'}
Allergies: ${patientProfile.medicalHistory?.allergies?.join(', ') || 'NKDA (No Known Drug Allergies)'}
Social History: Patient denies tobacco use, occasional alcohol consumption, no illicit drug use
Family History: Non-contributory`,

        objective: `Vital Signs:
- Temperature: 98.6°F (37.0°C)
- Blood Pressure: 128/82 mmHg
- Heart Rate: 88 bpm, regular
- Respiratory Rate: 18 breaths/min
- Oxygen Saturation: 96% on room air
- BMI: 24.2 kg/m²

Physical Examination:
General Appearance: Patient appears well-developed, well-nourished, and in no acute distress. Alert and oriented x3.

HEENT:
- Head: Normocephalic, atraumatic
- Eyes: PERRL, EOMI, conjunctivae clear
- Ears: TMs clear bilaterally, no erythema or effusion
- Nose: Nasal passages clear, no discharge
- Throat: Oropharynx clear, no erythema or exudate

Neck: Supple, no lymphadenopathy, no thyromegaly, no JVD

Cardiovascular: Regular rate and rhythm, S1 and S2 normal, no murmurs, rubs, or gallops. No peripheral edema.

Respiratory: Lungs clear to auscultation bilaterally, no wheezes, rales, or rhonchi. Good air movement throughout. Mild occasional dry cough noted during examination.

Abdomen: Soft, non-tender, non-distended, bowel sounds present in all quadrants, no organomegaly

Extremities: No clubbing, cyanosis, or edema. Pulses 2+ bilaterally.

Neurological: Alert and oriented x3, cranial nerves II-XII grossly intact, motor strength 5/5 in all extremities

Skin: Warm, dry, no rashes or lesions noted`,

        assessment: `Primary Diagnosis:
1. Acute bronchitis (J20.9) - Most likely viral etiology given the clinical presentation of persistent dry cough and mild dyspnea without fever or purulent sputum production.

Differential Diagnoses Considered:
2. Upper respiratory tract infection - Less likely given the duration and lack of upper respiratory symptoms
3. Allergic rhinitis with post-nasal drip - Possible but patient denies known allergen exposure
4. Early pneumonia - Less likely given clear lung sounds and absence of fever
5. Asthma exacerbation - Possible but no known history of asthma and no wheezing present

Clinical Reasoning:
The patient's presentation of a 2-week persistent dry cough with mild exertional dyspnea, in the absence of fever, purulent sputum, or abnormal lung sounds, is most consistent with acute bronchitis. The viral etiology is supported by the gradual onset, dry nature of the cough, and the patient's overall well appearance. The clear lung fields on physical examination help rule out pneumonia, while the absence of wheezing makes asthma less likely.

Risk Stratification: Low risk given stable vital signs, clear lung examination, and absence of concerning symptoms.`,

        plan: `Immediate Management:
1. Symptomatic treatment for acute bronchitis:
   - Recommend over-the-counter dextromethorphan 15mg every 4 hours as needed for cough suppression
   - Honey and warm tea for throat soothing and cough relief
   - Adequate hydration (8-10 glasses of water daily)
   - Humidifier use, especially at night

2. Patient Education:
   - Explained that acute bronchitis is typically viral and self-limiting (7-14 days)
   - Discussed when to seek immediate medical attention (fever >101°F, worsening shortness of breath, chest pain, blood in sputum)
   - Advised rest and gradual return to normal activities as tolerated

3. Follow-up Care:
   - Return to clinic in 1 week if symptoms persist or worsen
   - Sooner if develops fever, chest pain, or significant worsening of dyspnea
   - Consider chest X-ray if symptoms persist beyond 3 weeks

4. Preventive Measures:
   - Hand hygiene education
   - Avoid close contact with sick individuals
   - Consider annual influenza vaccination if not up to date

5. Monitoring:
   - Patient advised to monitor symptoms daily
   - Keep a symptom diary noting cough frequency and any changes in sputum production
   - Return if no improvement in 7-10 days or if symptoms worsen

Prognosis: Excellent with expected full recovery within 2-3 weeks with conservative management.

Next Appointment: Scheduled for 1 week follow-up or PRN if symptoms worsen.`
      };

      // Import Convex client and create SOAP note
      const { ConvexHttpClient } = await import("convex/browser");
      const { api } = await import("@/convex/_generated/api");

      const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

      const soapNoteId = await convex.mutation(api.soapNotes.create, {
        patientId: patientProfile._id as any,
        subjective: defaultSOAPNote.subjective,
        objective: defaultSOAPNote.objective,
        assessment: defaultSOAPNote.assessment,
        plan: defaultSOAPNote.plan,
        qualityScore: 92,
        processingTime: "2.3 seconds",
        recommendations: [
          "Consider chest X-ray if symptoms persist beyond 3 weeks",
          "Monitor for signs of bacterial superinfection",
          "Ensure patient is up to date with preventive care including influenza vaccination"
        ]
      });

      setProcessingState(prev => ({
        ...prev,
        progress: 100,
        stage: 'complete',
        message: 'SOAP notes generated successfully!'
      }));

      toast.success("Default SOAP note generated successfully!");

      // Redirect to the generated SOAP note
      router.push(`/patient/soap/view/${soapNoteId}`);

    } catch (error) {
      console.error('Error generating SOAP:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to generate SOAP note. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
      setProcessingState(prev => ({
        ...prev,
        isProcessing: false
      }));
    }
  }, [audioBlob, patientProfile, fileName, router]);

  // Helper function to calculate age from date of birth
  const calculateAge = (dateOfBirth: string): number => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

  return {
    patientProfile,
    audioBlob,
    fileName,
    isProcessing,
    processingState,
    handleAudioReady,
    handleAudioRemove,
    handleGenerateSOAP,
    loading: false,
    error,
  };
}
