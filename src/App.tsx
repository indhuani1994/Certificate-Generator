import { useMemo, useState } from 'react';
import Header from './components/Header/Header';
import ExcelUploader from './components/ExcelUploader/ExcelUploader';
import StudentTable from './components/StudentTable/StudentTable';
import CertificatePreview from './components/CertificatePreview/CertificatePreview';
import SignatureSelector from './components/SignatureSelector/SignatureSelector';
import DownloadButtons from './components/DownloadButtons/DownloadButtons';
import ResetButton from './components/ResetButton/ResetButton';
import TemplateSelector from './components/TemplateSelector/TemplateSelector';
import ContentSelector from './components/ContentSelector/ContentSelector';
import LayoutControls from './components/LayoutControls/LayoutControls';
import { parseExcelFile } from './services/excelParser';
import { StudentRecord, ValidationResult, Template, TemplateContent, SignatureImage, CertificateLayout } from './types';
import { validateRecords } from './utils/validationUtils';
import { formatDuration, formatDisplayDate } from './utils/dateUtils';
import { generateCertificatePdf, generateCertificatePdfBlob } from './services/certificateGenerator';
import { generateZip } from './services/zipGenerator';
import { saveAs } from 'file-saver';
import { getAllTemplates } from './config/templateConfigs';
import './styles/App.css';

const defaultLayout: CertificateLayout = {
  name: { left: 50, top: 24, fontFamily: 'Georgia' },
  regNo: { left: 50, top: 31, fontFamily: 'Georgia' },
  heading: { text: '', fontSize: 38, fontFamily: 'Georgia', color: '#0D095C', left: 50, top: 15 },
  content: { fontSize: 22, left: 50, top: 36, width: 80 },
  signature: { size: 10, left: 11, top: 68 }
};

function App() {
  const [templates] = useState<Template[]>(getAllTemplates());
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [selectedContent, setSelectedContent] = useState<TemplateContent | null>(null);
  const [selectedContentId, setSelectedContentId] = useState<string | null>(null);
  const [selectedContentTemplateId, setSelectedContentTemplateId] = useState<string | null>(null);
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [fileName, setFileName] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [progress, setProgress] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [signatures, setSignatures] = useState<SignatureImage[]>([]);
  const [layout, setLayout] = useState<CertificateLayout>(defaultLayout);

  const hasValidRecords = useMemo(() => students.some((r) => r.status === 'Valid'), [students]);
  const selectedStudent = students[selectedIndex] || null;
  const selectedBodyContentId = selectedContentId?.split(':').slice(1).join(':');

  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setSelectedContent(null);
    setSelectedContentId(null);
    setSelectedContentTemplateId(null);
    setSignatures([]);
    setErrorMessage('');
  };

  const handleAddSignatures = (files: FileList) => {
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) {
        setErrorMessage('Signature files must be images.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => setSignatures((current) => [...current, {
        id: `${file.name}-${file.size}-${file.lastModified}-${Math.random()}`,
        name: file.name,
        dataUrl: String(reader.result)
      }]);
      reader.onerror = () => setErrorMessage(`Could not read signature image "${file.name}".`);
      reader.readAsDataURL(file);
    });
  };

  const handleUploadTemplate = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please upload a PNG, JPG, JPEG, or WEBP image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const defaultTemplate = templates[0];
      const uploadedTemplate: Template = {
        id: 'uploaded-template',
        name: file.name,
        imagePath: String(reader.result),
        contents: defaultTemplate.contents
      };
      handleSelectTemplate(uploadedTemplate);
      setStatusMessage(`Custom template "${file.name}" selected.`);
    };
    reader.onerror = () => setErrorMessage('Could not read the template image.');
    reader.readAsDataURL(file);
  };

  const handleSelectContent = (contentId: string, content: TemplateContent, sourceTemplateId: string) => {
    setSelectedContentId(contentId);
    // Body text can come from any listed content, while layout stays tied to
    // the certificate template selected by the user.
    const templateFields = selectedTemplate
      ? Object.values(selectedTemplate.contents)[0]?.fields
      : content.fields;
    setSelectedContent({ ...content, fields: templateFields || content.fields });
    setSelectedContentTemplateId(selectedTemplate?.id || sourceTemplateId);
    setErrorMessage('');
  };

  const handleEnterManualContent = (bodyTemplate: string) => {
    if (!selectedTemplate || !bodyTemplate.trim()) {
      setSelectedContent(null);
      setSelectedContentId(null);
      setSelectedContentTemplateId(null);
      return;
    }
    const defaultFields = Object.values(selectedTemplate.contents)[0]?.fields;
    setSelectedContent({
      description: 'Custom Body Content',
      bodyTemplate,
      fields: defaultFields || {}
    });
    setSelectedContentId('custom');
    setSelectedContentTemplateId(selectedTemplate.id);
    setErrorMessage('');
  };

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

  const handleGenerateAll = async () => {
    if (!validation || validation.errorCount > 0) {
      setErrorMessage('Resolve validation errors before generating certificates.');
      return;
    }
    if (!hasValidRecords) {
      setErrorMessage('No valid students to generate certificates for.');
      return;
    }
    if (!selectedTemplate || !selectedContent) {
      setErrorMessage('Please select a template and content before generating.');
      return;
    }
    setIsGenerating(true);
    setErrorMessage('');
    setStatusMessage('Generating certificates...');
    setProgress(0);
    const validStudents = students.filter((r) => r.status === 'Valid');
    try {
      const outFiles: { name: string; blob: Blob }[] = [];
      for (let i = 0; i < validStudents.length; i += 1) {
        const student = validStudents[i];
        setProgress(Math.round(((i + 1) / validStudents.length) * 100));
        const blob = await generateCertificatePdfBlob(
          student,
          selectedContent.fields,
          selectedTemplate.imagePath,
          selectedContentTemplateId || selectedTemplate.id,
          selectedBodyContentId || undefined,
          selectedContent.bodyTemplate,
          signatures,
          layout
        );
        outFiles.push({ name: student.fileName, blob });
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
    if (!selectedStudent || !selectedTemplate || !selectedContent) return;
    setErrorMessage('');
    try {
      // Generate from the same selected template/content used by the preview.
      const blob = await generateCertificatePdf(
        selectedStudent,
        selectedContent.fields,
        selectedTemplate.imagePath,
        selectedContentTemplateId || selectedTemplate.id,
        selectedBodyContentId || undefined,
        selectedContent.bodyTemplate,
        signatures,
        layout
      );
      saveAs(blob, selectedStudent.fileName);
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
    setSignatures([]);
    setLayout(defaultLayout);
  };

  return (
    <div className="app-shell">
      <Header />
      <main className="main-content">
        <section className="template-section">
          <TemplateSelector
            templates={templates}
            selectedTemplate={selectedTemplate}
            onSelectTemplate={handleSelectTemplate}
            onUploadTemplate={handleUploadTemplate}
          />
        </section>

        <section className="content-section">
          <ContentSelector
            selectedTemplate={selectedTemplate}
            templates={templates}
            selectedContent={selectedContent}
            selectedContentId={selectedContentId}
            onSelectContent={handleSelectContent}
            onEnterManualContent={handleEnterManualContent}
          />
          {selectedTemplate && <SignatureSelector signatures={signatures} onAdd={handleAddSignatures} onRemove={(id) => setSignatures((current) => current.filter((signature) => signature.id !== id))} />}
          {selectedTemplate && <LayoutControls layout={layout} onChange={setLayout} />}
        </section>

        <section className="upload-section">
          <ExcelUploader 
            onUpload={handleFileUpload} 
            fileName={fileName} 
            studentCount={students.length} 
            statusMessage={statusMessage} 
            validation={validation}
            disabled={!selectedTemplate || !selectedContent}
          />
        </section>

        <section className="details-section">
          <StudentTable students={students} selectedIndex={selectedIndex} onSelect={handlePreviewSelect} isGenerating={isGenerating} />
        </section>

        <section className="preview-section">
          <CertificatePreview 
            student={selectedStudent} 
            certificateFields={selectedContent?.fields}
            templateImagePath={selectedTemplate?.imagePath}
            templateId={selectedContentTemplateId || selectedTemplate?.id}
          contentId={selectedBodyContentId || undefined}
          bodyTemplate={selectedContent?.bodyTemplate}
          signatures={signatures}
          layout={layout}
          />
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
