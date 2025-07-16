import { Id } from "@/convex/_generated/dataModel";
import { UseSOAPViewerReturn } from "@/components/ui/soap-viewer";

// Base types from the database
export interface Patient {
  _id: Id<"patients">;
  firstName: string;
  lastName: string;
  email?: string;
  mrn?: string;
  gender: string;
  dateOfBirth: string;
  primaryPhone?: string;
}

export interface SOAPNote {
  _id: Id<"soapNotes">;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  qualityScore?: number;
}

export interface SharedSOAPNote {
  _id: Id<"sharedSoapNotes">;
  patient: Patient;
  soapNote: SOAPNote;
  shareType: "direct_share" | "referral_share";
  message?: string;
  isRead: boolean;
  createdAt: number;
}

export interface Doctor {
  _id: Id<"doctors">;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  primarySpecialty: string;
  licenseNumber: string;
}

// Filter types
export interface SharedSOAPFilters {
  searchTerm: string;
  filterUnread: boolean;
  filterShareType: string;
  filterDateRange: string;
}

// Hook return types
export interface UseSharedSOAPAuthReturn {
  isLoading: boolean;
  isAuthenticated: boolean;
  isDoctor: boolean;
  doctorProfile: Doctor | null | undefined;
}

export interface UseSharedSOAPNotesReturn {
  sharedSOAPNotes: SharedSOAPNote[] | undefined;
  filteredNotes: SharedSOAPNote[];
  isLoading: boolean;
  error: string | null;
  filters: SharedSOAPFilters;
  setSearchTerm: (term: string) => void;
  setFilterUnread: (unread: boolean) => void;
  setFilterShareType: (type: string) => void;
  setFilterDateRange: (range: string) => void;
  clearAllFilters: () => void;
}

export interface UseSharedSOAPActionsReturn {
  selectedNote: SharedSOAPNote | null;
  actionModalOpen: boolean;
  handleViewSOAP: (note: SharedSOAPNote) => Promise<void>;
  handleTakeAction: (note: SharedSOAPNote) => Promise<void>;
  handleDownloadNote: (note: SharedSOAPNote) => void;
  closeActionModal: () => void;
  soapViewer: UseSOAPViewerReturn;
}

// Component props types
export interface SharedSOAPFiltersProps {
  filters: SharedSOAPFilters;
  onSearchChange: (term: string) => void;
  onUnreadToggle: (unread: boolean) => void;
  onShareTypeChange: (type: string) => void;
  onDateRangeChange: (range: string) => void;
  onClearFilters: () => void;
  className?: string;
}

export interface SharedSOAPNotesListProps {
  notes: SharedSOAPNote[];
  isLoading: boolean;
  onViewSOAP: (note: SharedSOAPNote) => Promise<void>;
  onTakeAction: (note: SharedSOAPNote) => Promise<void>;
  onDownloadNote: (note: SharedSOAPNote) => void;
  formatDate: (timestamp: number) => string;
  onClearFilters?: () => void;
  className?: string;
}

export interface SharedSOAPNoteCardProps {
  note: SharedSOAPNote;
  onViewSOAP: (note: SharedSOAPNote) => Promise<void>;
  onTakeAction: (note: SharedSOAPNote) => Promise<void>;
  onDownloadNote: (note: SharedSOAPNote) => void;
  formatDate: (timestamp: number) => string;
}



// Utility types
export type ShareType = "direct_share" | "referral_share";
export type DateRange = "all" | "today" | "week" | "month";
