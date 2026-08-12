import { StudentRecord } from '../../types';

interface DownloadButtonsProps {
  disabled: boolean;
  onDownloadSelected: () => void;
  onDownloadAll: () => void;
  selectedStudent: StudentRecord | null;
  progress: number | null;
}

const DownloadButtons = ({ disabled, onDownloadSelected, onDownloadAll, selectedStudent, progress }: DownloadButtonsProps) => (
  <div className="download-card">
    <div className="section-header">
      <h2>STEP 4 - DOWNLOAD</h2>
      <p>Download certificates individually or in bulk.</p>
    </div>
    <div className="download-actions">
      <button type="button" onClick={onDownloadSelected} disabled={disabled || !selectedStudent}>
        Download Selected Certificate
      </button>
      <button type="button" onClick={onDownloadAll} disabled={disabled}>
        Download All Certificates as ZIP
      </button>
    </div>
    {progress !== null && (
      <div className="progress-box">Generating certificates... {progress}%</div>
    )}
  </div>
);

export default DownloadButtons;
