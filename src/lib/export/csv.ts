/**
 * Utility to generate RFC-4180 compliant CSV strings with UTF-8 BOM for Microsoft Excel.
 */
export function generateExcelCsv(headers: string[], rows: (string | number | null | undefined)[][]): string {
  const escapeCell = (val: string | number | null | undefined): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val);
    if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return `"${str}"`;
  };

  const headerRow = headers.map(escapeCell).join(",");
  const dataRows = rows.map((row) => row.map(escapeCell).join(","));

  // Prepend UTF-8 BOM (\uFEFF) for immediate native Microsoft Excel compatibility
  return "\uFEFF" + [headerRow, ...dataRows].join("\r\n");
}
