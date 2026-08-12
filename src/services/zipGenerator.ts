import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export const generateZip = async (pdfFiles: { name: string; blob: Blob }[]) => {
  const zip = new JSZip();
  pdfFiles.forEach((pdf) => {
    zip.file(pdf.name, pdf.blob);
  });

  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, 'Certificates.zip');
};
