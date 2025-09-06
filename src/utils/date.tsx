
// Convert YYYY-MM-DD → DD-MM-YYYY
export const formatForUI = (dateStr: string): string => {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  return `${d}-${m}-${y}`;
};

// Convert DD-MM-YYYY → YYYY-MM-DD
export const formatForDB = (dateStr: string): string => {
  if (!dateStr) return "";
  const [d, m, y] = dateStr.split("-");
  return `${y}-${m}-${d}`;
};
