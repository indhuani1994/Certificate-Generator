import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';
import { StudentRecord, FieldPosition, SignatureImage, CertificateLayout } from '../types';
import certificateBackground from '../assets/Capture.JPG';
import { getBodyText } from '../config/templateConfigs';

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

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

export const generateCertificatePdfBlob = async (
  student: StudentRecord,
  fields?: Record<string, FieldPosition>,
  imagePath?: string,
  templateId?: string,
  contentId?: string,
  customBodyTemplate?: string,
  signatures: SignatureImage[] = [],
  layout?: CertificateLayout
): Promise<Blob> => {
  const imageToUse = imagePath || certificateBackground;
  const img = await loadImage(imageToUse);
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas initialization failed.');

  ctx.drawImage(img, 0, 0, img.width, img.height);
  
  const navy = '#0D095C';
  const gold = '#A27E16';
  const certificateLayout: CertificateLayout = layout || {
    heading: { text: '', fontSize: 38, fontFamily: 'Georgia', color: navy, left: 50, top: 15 },
    content: { fontSize: 22, left: 50, top: 36, width: 80 },
    signature: { size: 10, left: 11, top: 68 }
  };

  if (certificateLayout.heading.text.trim()) {
    ctx.textAlign = 'center';
    ctx.fillStyle = certificateLayout.heading.color;
    ctx.font = `bold ${certificateLayout.heading.fontSize}px "${certificateLayout.heading.fontFamily}"`;
    ctx.fillText(certificateLayout.heading.text, img.width * certificateLayout.heading.left / 100, img.height * certificateLayout.heading.top / 100);
  }

  // Use provided fields or fall back to defaults
  const fieldPositions = fields || {
    name: {
      left: '50%',
      top: '24%',
      fontSize: 'bold 36px Georgia',
      color: navy,
      textAlign: 'center' as const,
      width: '80%'
    },
    regNo: {
      left: '50%',
      top: '31%',
      fontSize: 'bold 28px Georgia',
      color: gold,
      textAlign: 'center' as const,
      width: '74%'
    }
  };

  ctx.textAlign = 'center';
  ctx.fillStyle = navy;
  ctx.font = 'bold 36px Georgia';
  ctx.fillText(student.name, img.width * 0.5, img.height * 0.27);
  ctx.strokeStyle = gold;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(img.width * 0.44, img.height * 0.29);
  ctx.lineTo(img.width * 0.56, img.height * 0.29);
  ctx.stroke();

  ctx.fillStyle = gold;
  ctx.font = 'bold 28px Georgia';
  ctx.fillText(`(REG. NO: ${student.regNo})`, img.width * 0.5, img.height * 0.335);

  ctx.fillStyle = navy;
  ctx.font = `${certificateLayout.content.fontSize}px Georgia`;
  
  // Generate body text based on template or use default
  const body = templateId && contentId
    ? getBodyText(
        templateId,
        contentId,
        student.name,
        student.course,
        student.startDateFormatted,
        student.endDateFormatted,
        getDurationMonths(student.duration),
        customBodyTemplate
      )
    : `has successfully completed the ${student.course} program at our Madurai center, conducted by Scope Tech Software Solution, with a duration from ${student.startDateFormatted} to ${student.endDateFormatted}. The participant's performance during this course was outstanding and exceeded our expectations.`;
  
  const maxWidth = img.width * certificateLayout.content.width / 100;
  const lines: string[] = [];
  let line = '';
  body.split(' ').forEach((word) => {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  });
  if (line) lines.push(line);
  // increase line spacing to accommodate larger font
  lines.forEach((text, index) => ctx.fillText(text, img.width * certificateLayout.content.left / 100, img.height * certificateLayout.content.top / 100 + index * (certificateLayout.content.fontSize * 1.45)));

  if (signatures.length) {
    const signatureAreaWidth = img.width * (100 - certificateLayout.signature.left - 5) / 100;
    const slotWidth = signatureAreaWidth / signatures.length;
    const maxSignatureWidth = Math.min(img.width * certificateLayout.signature.size / 100, slotWidth * 0.78);
    const signatureImages = await Promise.all(signatures.map((signature) => loadImage(signature.dataUrl)));
    signatureImages.forEach((signatureImage, index) => {
      const scale = Math.min(maxSignatureWidth / signatureImage.width, (img.height * certificateLayout.signature.size / 100) / signatureImage.height);
      const width = signatureImage.width * scale;
      const height = signatureImage.height * scale;
      const x = img.width * certificateLayout.signature.left / 100 + slotWidth * index + (slotWidth - width) / 2;
      ctx.drawImage(signatureImage, x, img.height * certificateLayout.signature.top / 100, width, height);
    });
  }

  const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [img.width, img.height] });
  pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, img.width, img.height);
  return pdf.output('blob');
};

export const generateCertificatePdf = async (
  student: StudentRecord,
  fields?: Record<string, FieldPosition>,
  imagePath?: string,
  templateId?: string,
  contentId?: string,
  customBodyTemplate?: string,
  signatures: SignatureImage[] = [],
  layout?: CertificateLayout
): Promise<Blob> => {
  return generateCertificatePdfBlob(student, fields, imagePath, templateId, contentId, customBodyTemplate, signatures, layout);
};
