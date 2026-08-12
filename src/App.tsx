import { useMemo, useState, useEffect } from 'react';
import Header from './components/Header/Header';
import ExcelUploader from './components/ExcelUploader/ExcelUploader';
import StudentTable from './components/StudentTable/StudentTable';
import CertificatePreview from './components/CertificatePreview/CertificatePreview';
import DownloadButtons from './components/DownloadButtons/DownloadButtons';
import ResetButton from './components/ResetButton/ResetButton';
import { parseExcelFile } from './services/excelParser';
import { CertificateData, StudentRecord, ValidationResult } from './types';
import { validateRecords } from './utils/validationUtils';
import { formatDuration, formatDisplayDate } from './utils/dateUtils';
import { generateCertificatePdf, generateCertificatePdfBlob } from './services/certificateGenerator';
import { fillTemplateDocxBlob } from './services/docxTemplateService';
import { generateZip } from './services/zipGenerator';
import { saveAs } from 'file-saver';
import './styles/App.css';

function App() {
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [templateFileName, setTemplateFileName] = useState('');
  const [fileName, setFileName] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [progress, setProgress] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const hasValidRecords = useMemo(() => students.some((r) => r.status === 'Valid'), [students]);
  const selectedStudent = students[selectedIndex] || null;

  const handleFileUpload = async (file: File) => {
    setErrorMessage('');
    setStatusMessage('');
    setStudents([]);
    setValidation(null);
    setSelectedIndex(0);
    setFileName(file.name);
    try {
      const records = await parseExcelFile(file);
      const formattedRecords = records.map((record, index) => ({
        ...record,
        startDateFormatted: formatDisplayDate(record.startDate),
        endDateFormatted: formatDisplayDate(record.endDate),
        duration: formatDuration(record.startDate, record.endDate),
        rowNumber: index + 2
      }));
      const validationResult = validateRecords(formattedRecords);
      setStudents(validationResult.records);
      setValidation(validationResult);
      setStatusMessage(validationResult.errorCount > 0 ? `Found ${validationResult.errorCount} error(s)` : `${validationResult.validCount} valid records`);
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : 'Upload failed.');
    }
  };

  useEffect(() => {
    // Load default template from extracted_media/Temp.docx (preferred), fallback to /Temp.docx
    const loadDefaultTemplate = async () => {
      try {
        const primary = await fetch('/extracted_media/Temp.docx');
        if (primary.ok) {
          const blob = await primary.blob();
          const file = new File([blob], 'Temp.docx', { type: blob.type || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
          setTemplateFile(file);
          setTemplateFileName(file.name);
          return;
        }
      } catch (e) {
        // ignore
      }
      try {
        const fallback = await fetch('/Temp.docx');
        if (fallback.ok) {
          const blob = await fallback.blob();
          const file = new File([blob], 'Temp.docx', { type: blob.type || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
          setTemplateFile(file);
          setTemplateFileName(file.name);
        }
      } catch (e) {
        // ignore
      }
    };
    loadDefaultTemplate();
  }, []);

  const handleGenerateAll = async () => {
    if (!validation || validation.errorCount > 0) {
      setErrorMessage('Resolve validation errors before generating certificates.');
      return;
    }
    if (!hasValidRecords) {
      setErrorMessage('No valid students to generate certificates for.');
      return;
    }
    setIsGenerating(true);
    setErrorMessage('');
    setStatusMessage('Generating certificates...');
    setProgress(0);
    const validStudents = students.filter((r) => r.status === 'Valid');
    try {
      const outFiles: { name: string; blob: Blob }[] = [];
      if (templateFile) {
        for (let i = 0; i < validStudents.length; i += 1) {
          const student = validStudents[i];
          setProgress(Math.round(((i + 1) / validStudents.length) * 100));
          const blob = await fillTemplateDocxBlob(templateFile, {
            name: student.name,
            regNo: student.regNo,
            course: student.course,
            startDate: student.startDateFormatted,
            endDate: student.endDateFormatted,
            duration: student.duration
          });
          outFiles.push({ name: student.fileName.replace(/\.pdf$/i, '.docx'), blob });
        }
      } else {
        for (let i = 0; i < validStudents.length; i += 1) {
          const student = validStudents[i];
          setProgress(Math.round(((i + 1) / validStudents.length) * 100));
          const blob = await generateCertificatePdfBlob(student);
          outFiles.push({ name: student.fileName, blob });
        }
      }
      await generateZip(outFiles);
      setStatusMessage(`${validStudents.length} certificates generated successfully.`);
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : 'Certificate generation failed.');
    } finally {
      setIsGenerating(false);
      setProgress(null);
    }
  };

  const handleDownloadSelected = async () => {
    if (!selectedStudent) return;
    setErrorMessage('');
    try {
      if (templateFile) {
        const blob = await fillTemplateDocxBlob(templateFile, {
          name: selectedStudent.name,
          regNo: selectedStudent.regNo,
          course: selectedStudent.course,
          startDate: selectedStudent.startDateFormatted,
          endDate: selectedStudent.endDateFormatted,
          duration: selectedStudent.duration
        });
        saveAs(blob, selectedStudent.fileName.replace(/\.pdf$/i, '.docx'));
      } else {
        await generateCertificatePdf(selectedStudent);
      }
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : 'Download failed.');
    }
  };

  const handlePreviewSelect = (index: number) => setSelectedIndex(index);

  const handleReset = () => {
    setStudents([]);
    setValidation(null);
    setFileName('');
    setSelectedIndex(0);
    setStatusMessage('');
    setErrorMessage('');
    setProgress(null);
    setIsGenerating(false);
    // preserve templateFile (default Temp.docx)
  };

  return (
    <div className="app-shell">
      <Header />
      <main className="main-content">
        <section className="upload-section">
          <ExcelUploader onUpload={handleFileUpload} fileName={fileName} studentCount={students.length} statusMessage={statusMessage} validation={validation} />
          
        </section>

        <section className="details-section">
          <StudentTable students={students} selectedIndex={selectedIndex} onSelect={handlePreviewSelect} isGenerating={isGenerating} />
        </section>

        <section className="preview-section">
          <CertificatePreview student={selectedStudent} />
        </section>

        <section className="actions-section">
          <DownloadButtons disabled={!hasValidRecords || isGenerating} onDownloadSelected={handleDownloadSelected} onDownloadAll={handleGenerateAll} selectedStudent={selectedStudent} progress={progress} />
          <ResetButton onReset={handleReset} />
          {errorMessage && <div className="error-box">{errorMessage}</div>}
          {statusMessage && <div className="status-box">{statusMessage}</div>}
        </section>
      </main>
    </div>
  );
}

export default App;
