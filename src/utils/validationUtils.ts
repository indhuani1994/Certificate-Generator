import { StudentRecord, StudentStatus, ValidationResult } from '../types';

export const validateRecords = (records: StudentRecord[]): ValidationResult => {
  const regNoCounts = records.reduce<Record<string, number>>((acc, record) => {
    const key = record.regNo.trim();
    if (key) {
      acc[key] = (acc[key] || 0) + 1;
    }
    return acc;
  }, {});

  const updatedRecords = records.map((record) => {
    const issues: string[] = [];
    if (!record.regNo) {
      issues.push('Reg No is required.');
    }
    if (!record.name) {
      issues.push('Name is required.');
    }
    if (!record.course) {
      issues.push('Course is required.');
    }
    if (!record.startDate || Number.isNaN(record.startDate.getTime())) {
      issues.push('Start Date is invalid.');
    }
    if (!record.endDate || Number.isNaN(record.endDate.getTime())) {
      issues.push('End Date is invalid.');
    }
    if (record.startDate && record.endDate && record.endDate < record.startDate) {
      issues.push('End Date cannot be earlier than Start Date.');
    }
    if (record.regNo && regNoCounts[record.regNo] > 1) {
      issues.push('Duplicate Reg No.');
    }

    const status: StudentStatus = issues.length > 0 ? 'Invalid' : 'Valid';

    return {
      ...record,
      status,
      issues
    };
  });

  const validCount = updatedRecords.filter((record) => record.status === 'Valid').length;
  const errorCount = updatedRecords.filter((record) => record.status === 'Invalid').length;
  const duplicateRegNos = Object.entries(regNoCounts).filter(([, count]) => count > 1).map(([regNo]) => regNo);

  return {
    records: updatedRecords,
    validCount,
    errorCount,
    duplicateRegNos
  };
};
