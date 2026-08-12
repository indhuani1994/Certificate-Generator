// Lightweight DOCX templating utilities using PizZip + Docxtemplater and Mammoth for preview
// Note: these run in-browser. Template placeholders should match keys used below (e.g. {name}, {regNo}).
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import mammoth from 'mammoth';

/**
 * The supplied Word template is a finished certificate rather than a
 * docxtemplater template. Word stores each word in a separate run, so a
 * normal string replacement cannot reliably find its content. Replace the
 * text of the known body paragraphs while retaining their paragraph layout.
 */
const fillFinishedCertificateTemplate = (xml: string, data: Record<string, any>): string => {
  const parser = new DOMParser();
  const document = parser.parseFromString(xml, 'application/xml');
  if (document.querySelector('parsererror')) {
    throw new Error('The certificate template contains invalid document XML.');
  }

  const paragraphs = Array.from(document.getElementsByTagName('w:p'));
  const values: Record<number, string> = {
    2: String(data.name || ''),
    6: `(REG. NO: ${String(data.regNo || '')})`,
    8: 'has successfully completed the\tconducted by Scope Tech Software',
    9: `${String(data.course || '')}, Madurai, with a duration of ${String(data.duration || '')} from ${String(data.startDate || '')} to ${String(data.endDate || '')}`,
    10: '. The participant’s performance during this course was outstanding and exceeded our expectations.'
  };

  Object.entries(values).forEach(([indexText, value]) => {
    const paragraph = paragraphs[Number(indexText)];
    if (!paragraph) return;

    const runs = Array.from(paragraph.getElementsByTagName('w:r'));
    let firstRun = runs[0];
    if (!firstRun) {
      firstRun = document.createElementNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main', 'w:r');
      paragraph.appendChild(firstRun);
    }

    runs.slice(1).forEach((run) => run.parentNode?.removeChild(run));
    Array.from(firstRun.childNodes)
      .filter((node) => node.nodeName !== 'w:rPr')
      .forEach((node) => firstRun.removeChild(node));

    value.split('\t').forEach((part, partIndex) => {
      if (partIndex > 0) firstRun.appendChild(document.createElementNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main', 'w:tab'));
      const textNode = document.createElementNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main', 'w:t');
      textNode.setAttribute('xml:space', 'preserve');
      textNode.textContent = part;
      firstRun.appendChild(textNode);
    });
  });

  return new XMLSerializer().serializeToString(document);
};

export const fillTemplateDocxBlob = async (templateFile: File, data: Record<string, any>): Promise<Blob> => {
  const arrayBuffer = await templateFile.arrayBuffer();
  const zip = new PizZip(arrayBuffer as any);

  const documentXmlPath = 'word/document.xml';
  const documentFile = zip.file(documentXmlPath);
  if (documentFile) {
    const documentXml = documentFile.asText();
    const hasFinishedCertificate = documentXml.includes('CERTIFICATE') &&
      documentXml.includes('COMPLETION') && documentXml.includes('STS02202504257');
    if (hasFinishedCertificate) {
      const filledXml = fillFinishedCertificateTemplate(documentXml, data);
      zip.file(documentXmlPath, filledXml);
      const out = zip.generate({ type: 'uint8array' });
      return new Blob([out.buffer as ArrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    }
  }

  // First attempt: use Docxtemplater if template contains templating tags like {name}
  try {
    const doc = new (Docxtemplater as any)(zip, { paragraphLoop: true, linebreaks: true });
    doc.setData(data);
    doc.render();
    const out = doc.getZip().generate({ type: 'uint8array' });
    return new Blob([out.buffer as ArrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
  } catch (docxErr) {
    // Fallback: attempt simple raw text replacement in document.xml for common placeholder patterns
    try {
      const xmlPath = 'word/document.xml';
      if (zip.file(xmlPath)) {
        const fallbackFile = zip.file(xmlPath);
        if (!fallbackFile) throw new Error('Template document.xml is missing.');
        let xml = fallbackFile.asText();

        // common placeholder tokens from your template (case-sensitive variants covered)
        const replacements: Record<string, string> = {
          '(Name)': String(data.name || ''),
          '(name)': String(data.name || ''),
          '(reg no)': String(data.regNo || ''),
          '(REG. NO: (reg no))': `REG. NO: ${String(data.regNo || '')}`,
          '(Course)': String(data.course || ''),
          '(course)': String(data.course || ''),
          '(Count of months)': String(data.duration || ''),
          '(Duration)': String(data.startDate || '')
        };

        Object.entries(replacements).forEach(([token, val]) => {
          xml = xml.split(token).join(val);
        });

        zip.file(xmlPath, xml);
        const out = zip.generate({ type: 'uint8array' });
        return new Blob([out.buffer as ArrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      }
    } catch (fallbackErr) {
      // continue to throw below
    }

    throw new Error((docxErr && (docxErr as any).message) || 'Template rendering failed');
  }
};

export const docxBlobToHtml = async (blob: Blob): Promise<string> => {
  const arrayBuffer = await blob.arrayBuffer();
  const res = await mammoth.convertToHtml({ arrayBuffer });
  return res.value;
};
