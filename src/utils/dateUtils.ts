export const formatDisplayDate = (date: Date | null): string => {
  if (!date || Number.isNaN(date.getTime())) {
    return '';
  }
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear());
  return `${day}/${month}/${year}`;
};

export const formatDuration = (startDate: Date | null, endDate: Date | null): string => {
  if (!startDate || !endDate || Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return '';
  }
  return `${formatDisplayDate(startDate)} - ${formatDisplayDate(endDate)}`;
};
