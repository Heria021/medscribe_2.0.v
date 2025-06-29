import { Id } from "@/convex/_generated/dataModel";

// Core SOAP Note interface
export interface SOAPNote {
  _id: Id<"soapNotes">;
  patientId: Id<"patients">;
  audioRecordingId?: Id<"audioRecordings">;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  highlightedHtml?: string;
  qualityScore?: number;
  processingTime?: string;
  recommendations?: string[];
  externalRecordId?: string;
  googleDocUrl?: string;
  createdAt: number;
  updatedAt: number;
}

// Patient profile interface
export interface PatientProfile {
  _id: Id<"patients">;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth?: string;
  phone?: string;
  address?: string;
  emergencyContact?: string;
  medicalHistory?: string[];
  allergies?: string[];
  currentMedications?: string[];
  createdAt: number;
  updatedAt: number;
}

// Shared SOAP Note interface
export interface SharedSOAPNote {
  _id: Id<"sharedSoapNotes">;
  soapNoteId: Id<"soapNotes">;
  patientId: Id<"patients">;
  doctorId: Id<"doctors">;
  doctor?: {
    _id: Id<"doctors">;
    firstName: string;
    lastName: string;
    email: string;
    specialization?: string;
  };
  isRead: boolean;
  sharedAt: number;
  readAt?: number;
  notes?: string;
}

// Referral interface
export interface Referral {
  _id: Id<"referrals">;
  patientId: Id<"patients">;
  fromDoctorId: Id<"doctors">;
  toDoctorId: Id<"doctors">;
  soapNoteId?: Id<"soapNotes">;
  reason: string;
  status: "pending" | "accepted" | "declined" | "completed";
  priority: "low" | "medium" | "high" | "urgent";
  createdAt: number;
  updatedAt: number;
}

// Timeline item interface
export interface TimelineItem {
  id: string;
  type: "shared" | "referral" | "created";
  title: string;
  description: string;
  timestamp: number;
  status?: "pending" | "completed" | "read" | "unread";
  icon?: React.ComponentType<{ className?: string }>;
  color?: string;
}

// Stats interface
export interface SOAPStats {
  totalNotes: number;
  sharedCount: number;
  avgQuality: number;
  recentNotes: number;
}

// Search and filter interfaces
export interface SearchFilters {
  searchTerm: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
  qualityRange?: {
    min: number;
    max: number;
  };
  sharedOnly?: boolean;
  sortBy?: "date" | "quality" | "shared";
  sortOrder?: "asc" | "desc";
}

// Component prop interfaces
export interface BaseSOAPComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface SOAPNoteCardProps extends BaseSOAPComponentProps {
  note: SOAPNote;
  sharedWith?: SharedSOAPNote[];
  timelineItems?: TimelineItem[];
  onDownload?: (note: SOAPNote) => void;
  onShare?: (noteId: Id<"soapNotes">) => void;
  onView?: (noteId: Id<"soapNotes">) => void;
  formatDate?: (timestamp: number) => string;
  getQualityColor?: (score?: number) => string;
  compact?: boolean;
  showActions?: boolean;
}

export interface SOAPNotesGridProps extends BaseSOAPComponentProps {
  notes: SOAPNote[];
  sharedNotesMap?: Map<string, SharedSOAPNote[]>;
  referrals?: Referral[];
  onDownload?: (note: SOAPNote) => void;
  onShare?: (noteId: Id<"soapNotes">) => void;
  onView?: (noteId: Id<"soapNotes">) => void;
  formatDate?: (timestamp: number) => string;
  getQualityColor?: (score?: number) => string;
  loading?: boolean;
  virtualized?: boolean;
}

export interface SOAPSearchBarProps extends BaseSOAPComponentProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filteredCount: number;
  totalCount: number;
  placeholder?: string;
  debounceMs?: number;
  showFilters?: boolean;
  filters?: SearchFilters;
  onFiltersChange?: (filters: SearchFilters) => void;
}

export interface SOAPStatsOverviewProps extends BaseSOAPComponentProps {
  stats: SOAPStats;
  loading?: boolean;
  compact?: boolean;
  showTrends?: boolean;
}

export interface SOAPEmptyStateProps extends BaseSOAPComponentProps {
  searchTerm?: string;
  onClearSearch?: () => void;
  onCreateNew?: () => void;
  title?: string;
  description?: string;
  actionLabel?: string;
  showCreateAction?: boolean;
}

export interface SOAPHistoryHeaderProps extends BaseSOAPComponentProps {
  patientProfile?: PatientProfile;
  onCreateNew?: () => void;
  showCreateButton?: boolean;
  title?: string;
  subtitle?: string;
}

// Hook return types (only keeping what's used)
export interface UseSOAPNoteDialogReturn {
  selectedNote: SOAPNote | null;
  isOpen: boolean;
  openDialog: (note: SOAPNote) => void;
  closeDialog: () => void;
  setOpen: (open: boolean) => void;
}

export interface UseSOAPDocumentViewerReturn {
  selectedNote: SOAPNote | null;
  isViewingDocument: boolean;
  openDocument: (note: SOAPNote) => void;
  closeDocument: () => void;
  setViewingDocument: (viewing: boolean) => void;
}

export interface UseSOAPStatsReturn {
  stats: SOAPStats;
  loading: boolean;
  error: string | null;
  refreshStats: () => void;
}



// Utility types
export type QualityLevel = "excellent" | "good" | "fair" | "poor";
export type SortOption = "date" | "quality" | "shared" | "alphabetical";
export type ViewMode = "grid" | "list" | "compact";

// Error types
export interface SOAPError {
  code: string;
  message: string;
  details?: any;
}

// Loading states
export interface LoadingStates {
  notes: boolean;
  sharing: boolean;
  downloading: boolean;
  stats: boolean;
}
