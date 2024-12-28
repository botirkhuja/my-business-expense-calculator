// Simple date formatter function for valueFormatter
export function dateFormatter(params: { value: string }) {
  const value = params.value;
  if (!value) return "";
  const date = new Date(value);
  return date.toLocaleDateString();
}
