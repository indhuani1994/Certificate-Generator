import * as XLSX from 'xlsx';
import { StudentRecord } from '../types';
import { formatDisplayDate } from '../utils/dateUtils';
import { generateFileName } from '../utils/filenameUtils';

interface ExcelRow {
  [key: string]: any;
}

const requiredColumns = ['Reg No', 'Name', 'Course', 'Start Date', 'End Date'];

export const parseExcelFile = async (file: File): Promise<StudentRecord[]> => {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array' });
  if (workbook.SheetNames.length === 0) {
    throw new Error('Empty Excel file.');
  }
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
  if (rows.length === 0) {
    throw new Error('Excel file contains no rows.');
  }
  const headers = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0] as string[];
  const missing = requiredColumns.filter((col) => !headers.includes(col));
  if (missing.length > 0) {
    throw new Error(`Required column(s) missing: ${missing.join(', ')}`);
  }

  return rows
    .map((row, index) => {
      const regNo = String(row['Reg No'] || '').trim();
      const name = String(row['Name'] || '').trim();
      const course = String(row['Course'] || '').trim();
      const startDateCell = row['Start Date'];
      const endDateCell = row['End Date'];

      const startDate = parseExcelDate(startDateCell);
      const endDate = parseExcelDate(endDateCell);

      return {
        regNo,
        name,
        course,
        startDate,
        endDate,
        startDateFormatted: formatDisplayDate(startDate),
        endDateFormatted: formatDisplayDate(endDate),
        duration: '',
        rowNumber: index + 2,
        status: 'Valid' as const,
        issues: [],
        fileName: generateFileName({ regNo, name, course })
      };
    })
    .filter((record) => {
      return !(
        !record.regNo && !record.name && !record.course && !record.startDate && !record.endDate
      );
    });
};

const parseExcelDate = (value: any): Date | null => {
  if (value == null || value === '') {
    return null;
  }
  if (value instanceof Date) {
    return value;
  }
  if (typeof value === 'number') {
    return XLSX.SSF.parse_date_code(value) ? new Date(XLSX.SSF.parse_date_code(value).y, XLSX.SSF.parse_date_code(value).m - 1, XLSX.SSF.parse_date_code(value).d) : null;
  }
  const text = String(value).trim();
  const parsed = new Date(text);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed;
  }
  const parts = text.split(/[-./]/).map((part) => parseInt(part, 10));
  if (parts.length === 3) {
    const [day, month, year] = parts;
    if (!Number.isNaN(day) && !Number.isNaN(month) && !Number.isNaN(year)) {
      return new Date(year, month - 1, day);
    }
  }
  return null;
};
