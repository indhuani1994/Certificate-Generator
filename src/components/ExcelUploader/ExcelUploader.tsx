import { ValidationResult } from '../../types';

interface ExcelUploaderProps {
  onUpload: (file: File) => void;
  fileName: string;
  studentCount: number;
  statusMessage: string;
  validation: ValidationResult | null;
}

const ExcelUploader = ({ onUpload, fileName, studentCount, statusMessage, validation }: ExcelUploaderProps) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      onUpload(event.target.files[0]);
    }
  };

  return (
    <div className="uploader-card">
      <div className="section-header">
        <h2>STEP 1 - UPLOAD EXCEL</h2>
        <p>Upload Excel File</p>
      </div>
      <label className="upload-button">
        Choose Excel File
        <input type="file" accept=".xlsx,.xls" onChange={handleChange} />
      </label>
      <div className="upload-info">
        <div>
          <strong>File:</strong> {fileName || 'No file selected'}
        </div>
        <div>
          <strong>Students found:</strong> {studentCount}
        </div>
        <div>
          <strong>Status:</strong> {statusMessage || 'Waiting for upload'}
        </div>
      </div>
      {validation?.duplicateRegNos.length ? (
        <div className="warning-box">Duplicate Registration Number found: {validation.duplicateRegNos.join(', ')}</div>
      ) : null}
    </div>
  );
};

export default ExcelUploader;
