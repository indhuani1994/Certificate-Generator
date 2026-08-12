export type StudentStatus = 'Valid' | 'Invalid';

export interface StudentRecord {
  regNo: string;
  name: string;
  course: string;
  startDate: Date | null;
  endDate: Date | null;
  startDateFormatted: string;
  endDateFormatted: string;
  duration: string;
  rowNumber: number;
  status: StudentStatus;
  issues: string[];
  fileName: string;
}

export interface ValidationResult {
  records: StudentRecord[];
  validCount: number;
  errorCount: number;
  duplicateRegNos: string[];
}

export interface CertificateData {
  regNo: string;
  name: string;
  course: string;
  duration: string;
}
