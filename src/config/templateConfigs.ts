import { Template } from '../types';

export const templateConfigs: Record<string, Template> = {
  certificate: {
    id: 'certificate',
    name: 'Course Completion',
    imagePath: '/extracted_media/Capture.JPG',
    contents: {
      standard: {
        description: 'Standard Certificate Content',
        bodyTemplate: 'has successfully completed the {course} program at our Madurai center, conducted by Scope Tech Software Solution, with a duration from {startDate} to {endDate}. The participant\'s performance during this course was outstanding and exceeded our expectations.',
        fields: {
          regNo: {
            left: '50%',
            top: '31%',
            fontSize: 'clamp(14px, 1.8vw, 28px)',
            color: '#A27E16',
            textAlign: 'center' as const,
            width: '74%'
          },
          name: {
            left: '50%',
            top: '24%',
            fontSize: 'clamp(20px, 2.6vw, 44px)',
            color: '#0D095C',
            textAlign: 'center' as const,
            width: '80%'
          },
          course: {
            left: '50%',
            top: '40%',
            fontSize: '28px',
            color: '#0D095C',
            textAlign: 'center' as const,
            width: '80%'
          },
          duration: {
            left: '50%',
            top: '48%',
            fontSize: '22px',
            color: '#0D095C',
            textAlign: 'center' as const,
            width: '80%'
          }
        }
      },
      valueAddedCourse: {
        description: 'Value Added Course Certificate Content',
        bodyTemplate: 'has successfully completed the {course} Value Added Course at our Madurai center, conducted by Scope Tech Software Solution, with a duration from {startDate} to {endDate}. The participant has successfully completed the prescribed training and demonstrated excellent commitment, active participation, and a strong willingness to learn throughout the program. Their performance and dedication during the course were commendable and exceeded our expectations.',
        fields: {
          regNo: {
            left: '50%',
            top: '31%',
            fontSize: 'clamp(14px, 1.8vw, 28px)',
            color: '#A27E16',
            textAlign: 'center' as const,
            width: '74%'
          },
          name: {
            left: '50%',
            top: '24%',
            fontSize: 'clamp(20px, 2.6vw, 44px)',
            color: '#0D095C',
            textAlign: 'center' as const,
            width: '80%'
          },
          course: {
            left: '50%',
            top: '40%',
            fontSize: '28px',
            color: '#0D095C',
            textAlign: 'center' as const,
            width: '80%'
          },
          duration: {
            left: '50%',
            top: '48%',
            fontSize: '22px',
            color: '#0D095C',
            textAlign: 'center' as const,
            width: '80%'
          }
        }
      }
    }
  },
  intern: {
    id: 'intern',
    name: 'Internship',
    imagePath: '/extracted_media/Intern.JPG',
    contents: {
      internContent: {
        description: 'Internship Certificate Content',
        bodyTemplate: 'has successfully completed the Internship Program in {course} Using Java conducted by Scope Tech Software Solution, Madurai, for a duration of {durationMonths} Months from {startDate} to {endDate}. During the internship period, the participant showed dedication, technical skills & active involvement in projects. We appreciate the participant\'s efforts and wish them success in their future career.',
        fields: {
          regNo: {
            left: '50%',
            top: '32%',
            fontSize: 'clamp(14px, 1.8vw, 28px)',
            color: '#1a1a1a',
            textAlign: 'center' as const,
            width: '74%'
          },
          name: {
            left: '50%',
            top: '25%',
            fontSize: 'clamp(20px, 2.6vw, 44px)',
            color: '#0D095C',
            textAlign: 'center' as const,
            width: '80%'
          },
          course: {
            left: '50%',
            top: '41%',
            fontSize: '22px',
            color: '#0D095C',
            textAlign: 'center' as const,
            width: '80%'
          },
          duration: {
            left: '50%',
            top: '50%',
            fontSize: '18px',
            color: '#0D095C',
            textAlign: 'center' as const,
            width: '80%'
          }
        }
      }
    }
  }
};

export const getTemplateById = (templateId: string): Template | undefined => {
  return templateConfigs[templateId];
};

export const getContentByTemplate = (templateId: string, contentId: string) => {
  const template = getTemplateById(templateId);
  if (!template) return null;
  return template.contents[contentId];
};

export const getAllTemplates = (): Template[] => {
  return Object.values(templateConfigs);
};

export const getBodyText = (
  templateId: string,
  contentId: string,
  name: string,
  course: string,
  startDate: string,
  endDate: string,
  durationMonths?: number,
  customBodyTemplate?: string
): string => {
  const content = getContentByTemplate(templateId, contentId);
  const bodyTemplate = customBodyTemplate || content?.bodyTemplate;
  if (!bodyTemplate) {
    return `has successfully completed the ${course} program at our Madurai center, conducted by Scope Tech Software Solution, with a duration from ${startDate} to ${endDate}. The participant's performance during this course was outstanding and exceeded our expectations.`;
  }

  let body = bodyTemplate;
  body = body.replace(/{course}/g, course);
  body = body.replace(/{startDate}/g, startDate);
  body = body.replace(/{endDate}/g, endDate);
  body = body.replace(/{name}/g, name);
  
  if (durationMonths !== undefined) {
    body = body.replace(/{durationMonths}/g, durationMonths.toString());
  }

  return body;
};
