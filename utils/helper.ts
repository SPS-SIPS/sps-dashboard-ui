
export function formatDate(
  input: string | Date | number | null | undefined,
  includeTime = false
): string {
  
  if (input === null || input === undefined) return '';

 
  if (typeof input === 'string') {
    input = input.trim();
    if (input === '') return '';
  }

 
  const sentinelRegex = /^0001-01-01T00:00:00(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?$/;
  if (typeof input === 'string' && sentinelRegex.test(input)) return '';

  const date = input instanceof Date ? input : new Date(input as string | number);
  if (Number.isNaN(date.getTime())) return '';

  const pad = (n: number) => (n < 10 ? '0' + n : String(n));

  
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());

  if (!includeTime) return `${year}-${month}-${day}`;

  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export default formatDate;
