import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';
import { StudentRecord } from '../types';
import certificateBackground from '../assets/Capture.JPG';

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

export const generateCertificatePdfBlob = async (student: StudentRecord): Promise<Blob> => {
  const img = await loadImage(certificateBackground);
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas initialization failed.');

  ctx.drawImage(img, 0, 0, img.width, img.height);
  const navy = '#0D095C';
  const gold = '#A27E16';

  // Remove/cover the sample dynamic content from the background image.
  ctx.fillStyle = '#ffffff';
  // expand the cover area to ensure any background text is hidden
  ctx.fillRect(img.width * 0.06, img.height * 0.18, img.width * 0.88, img.height * 0.36);

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
  ctx.font = '32px Georgia';
  const body = `has successfully completed the ${student.course} program at our Madurai center, conducted by Scope Tech Software Solution, with a duration from ${student.startDateFormatted} to ${student.endDateFormatted}. The participant's performance during this course was outstanding and exceeded our expectations.`;
  const maxWidth = img.width * 0.80;
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
  lines.forEach((text, index) => ctx.fillText(text, img.width * 0.5, img.height * 0.405 + index * 44));

  const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [img.width, img.height] });
  pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, img.width, img.height);
  return pdf.output('blob');
};

export const generateCertificatePdf = async (student: StudentRecord): Promise<void> => {
  saveAs(await generateCertificatePdfBlob(student), student.fileName);
};
