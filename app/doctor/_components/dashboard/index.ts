// Doctor Dashboard Components
export { DoctorFeatureCard } from './DoctorFeatureCard';
export { PatientListCard } from './PatientListCard';
export { AIAssistantCard } from './AIAssistantCard';
export { DoctorQuickActions } from './DoctorQuickActions';
export { DoctorDashboardSkeleton } from './DoctorDashboardSkeleton';

// Types
export type { DoctorFeatureCardProps } from './DoctorFeatureCard';
export type { PatientListCardProps } from './PatientListCard';
export type { AIAssistantCardProps } from './AIAssistantCard';
export type { DoctorQuickActionsProps } from './DoctorQuickActions';

// Common types for doctor dashboard
export interface DoctorGradient {
  from: string;
  to: string;
  border: string;
  iconBg: string;
  textColor: string;
  badgeColor?: string;
  itemBg?: string;
  itemBorder?: string;
}

export interface DoctorQuickAction {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  disabled?: boolean;
}

export interface PatientInfo {
  _id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  primaryPhone: string;
}

export interface PatientRelationship {
  _id: string;
  patient: PatientInfo;
}
