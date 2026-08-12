import { StudentRecord } from '../../types';
import certificateFields from '../../config/certificateFields';
import certificateBackground from '../../assets/Capture.JPG';

interface CertificatePreviewProps {
  student: StudentRecord | null;
}

const CertificatePreview = ({ student }: CertificatePreviewProps) => {
  if (!student) {
    return (
      <div className="preview-card empty-preview">
        <div className="section-header">
          <h2>STEP 3 - CERTIFICATE PREVIEW</h2>
          <p>Select a student to preview the filled certificate.</p>
        </div>
        <div className="preview-placeholder">No certificate selected.</div>
      </div>
    );
  }

  return (
    <div className="preview-card">
      <div className="section-header">
        <h2>STEP 3 - CERTIFICATE PREVIEW</h2>
        <p>{student.regNo} - {student.name}</p>
      </div>
      <div className="certificate-preview">
        <div className="certificate-image-wrapper">
          <img src={certificateBackground} alt="Certificate background" className="certificate-background" />
          <div className="certificate-variable-area certificate2-variable-area" />
          <div className="certificate-text certificate-name" style={certificateFields.name}>{student.name}</div>
          <div className="certificate-text certificate-regno" style={certificateFields.regNo}>{`(REG. NO: ${student.regNo})`}</div>
          <div className="certificate-text certificate2-body">
            has successfully completed the <strong>{student.course}</strong> program at our Madurai center, conducted by Scope Tech Software Solution, with a duration from <strong>{student.startDateFormatted}</strong> to <strong>{student.endDateFormatted}</strong>. The participant’s performance during this course was outstanding and exceeded our expectations.
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificatePreview;
