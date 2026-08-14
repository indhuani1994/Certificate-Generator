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

export interface FieldPosition {
  left: string;
  top: string;
  fontSize: string;
  color: string;
  textAlign: 'left' | 'center' | 'right';
  width: string;
}

export interface TemplateContent {
  fields: Record<string, FieldPosition>;
  description: string;
  bodyTemplate?: string;
}

export interface Template {
  id: string;
  name: string;
  imagePath: string;
  contents: Record<string, TemplateContent>;
}
