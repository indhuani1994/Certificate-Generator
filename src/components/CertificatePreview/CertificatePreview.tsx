import { StudentRecord, FieldPosition, SignatureImage, CertificateLayout } from '../../types';
import certificateFields from '../../config/certificateFields';
import certificateBackground from '../../assets/Capture.JPG';
import { getBodyText } from '../../config/templateConfigs';

interface CertificatePreviewProps {
  student: StudentRecord | null;
  certificateFields?: Record<string, FieldPosition>;
  templateImagePath?: string;
  templateId?: string;
  contentId?: string;
  bodyTemplate?: string;
  signatures?: SignatureImage[];
  layout?: CertificateLayout;
}

const CertificatePreview = ({ 
  student, 
  certificateFields: customFields, 
  templateImagePath,
  templateId = 'certificate',
  contentId = 'standard',
  bodyTemplate,
  signatures = [],
  layout = {
    heading: { text: '', fontSize: 38, fontFamily: 'Georgia', color: '#0D095C', left: 50, top: 15 },
    content: { fontSize: 22, left: 50, top: 36, width: 80 },
    signature: { size: 10, left: 11, top: 68 }
  }
}: CertificatePreviewProps) => {
  const fields = customFields || certificateFields;
  const imageSource = templateImagePath || certificateBackground;

  // Calculate duration in months
  const getDurationMonths = (duration: string): number => {
    // Duration format: "01/03/2026 - 31/05/2026"
    const parts = duration.split(' - ');
    if (parts.length === 2) {
      const [startStr, endStr] = parts;
      const startDate = new Date(startStr.split('/').reverse().join('-'));
      const endDate = new Date(endStr.split('/').reverse().join('-'));
      const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());
      return Math.max(1, months);
    }
    return 1;
  };

  const bodyText = student 
    ? getBodyText(
        templateId,
        contentId,
        student.name,
        student.course,
        student.startDateFormatted,
        student.endDateFormatted,
        getDurationMonths(student.duration),
        bodyTemplate
      )
    : '';

  if (!student) {
    return (
      <div className="preview-card empty-preview">
        <div className="section-header">
          <h2>STEP 5 - CERTIFICATE PREVIEW</h2>
          <p>Select a student to preview the filled certificate.</p>
        </div>
        <div className="preview-placeholder">No certificate selected.</div>
      </div>
    );
  }

  return (
    <div className="preview-card">
      <div className="section-header">
        <h2>STEP 5 - CERTIFICATE PREVIEW</h2>
        <p>{student.regNo} - {student.name}</p>
      </div>
      <div className="certificate-preview">
        <div className="certificate-image-wrapper">
          <img src={imageSource} alt="Certificate background" className="certificate-background" />
          <div className="certificate-variable-area certificate2-variable-area" />
          {layout.heading.text.trim() && <div className="certificate-text certificate-heading" style={{ left: `${layout.heading.left}%`, top: `${layout.heading.top}%`, fontSize: `${layout.heading.fontSize}px`, fontFamily: layout.heading.fontFamily, color: layout.heading.color }}>{layout.heading.text}</div>}
          <div className="certificate-text certificate-name" style={fields.name}>{student.name}</div>
          <div className="certificate-text certificate-regno" style={fields.regNo}>{`(REG. NO: ${student.regNo})`}</div>
          <p>   </p>
          <div className="certificate-text certificate2-body" style={{ left: `${layout.content.left - layout.content.width / 2}%`, top: `${layout.content.top}%`, width: `${layout.content.width}%`, fontSize: `${layout.content.fontSize}px` }}>
            {bodyText}
          </div>
          <div className="signature-overlay" style={{ left: `${layout.signature.left}%`, top: `${layout.signature.top}%`, width: `${100 - layout.signature.left - 5}%`, height: `${layout.signature.size}%`, '--signature-count': signatures.length } as React.CSSProperties}>
            {signatures.map((signature) => <img key={signature.id} src={signature.dataUrl} alt={signature.name} style={{ maxWidth: `${layout.signature.size}%` }} />)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificatePreview;
