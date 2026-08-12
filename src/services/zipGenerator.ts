import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export const generateZip = async (pdfFiles: { name: string; blob: Blob }[]) => {
  if (pdfFiles.length === 0) {
    throw new Error('No certificate files available to zip.');
  }

  const zip = new JSZip();
  pdfFiles.forEach((pdf) => {
    zip.file(pdf.name, pdf.blob, { binary: true });
  });

  const content = await zip.generateAsync({ type: 'blob', mimeType: 'application/zip' });
  if (!content || !(content instanceof Blob)) {
    throw new Error('Failed to generate ZIP archive.');
  }
  saveAs(content, 'Certificates.zip');
};
