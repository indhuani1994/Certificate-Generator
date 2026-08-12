interface FileNameData {
  regNo: string;
  name: string;
  course: string;
}

const sanitize = (value: string): string => {
  return value
    .replace(/[\\/:*?"<>|]/g, '')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .trim();
};

export const generateFileName = ({ regNo, name, course }: FileNameData): string => {
  const safeReg = sanitize(regNo || 'REG');
  const safeName = sanitize(name || 'Student');
  const safeCourse = sanitize(course || 'Course');
  return `${safeReg}_${safeName}_${safeCourse}.pdf`;
};
