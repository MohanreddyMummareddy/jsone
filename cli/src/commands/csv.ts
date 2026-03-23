/**
 * CSV command: export jsone data as CSV
 */

import fs from 'fs';
import { parseJsone, tableFromJsone, formatCellValue } from '@jsone/core';

export async function cmdCSV(filePath: string, outputPath: string): Promise<void> {
  const content = fs.readFileSync(filePath, 'utf-8');
  const parsed = parseJsone(content);
  const table = tableFromJsone(parsed.data);

  if (table.rows.length === 0) {
    console.log('No table data found');
    return;
  }

  const rows: string[] = [];

  // Header
  const headers = table.columns.map((col) => escapeCSV(col.label));
  rows.push(headers.join(','));

  // Data rows
  for (const row of table.rows) {
    const cells = table.columns.map((col) => {
      const value = row[col.key];
      const { full } = formatCellValue(value);
      return escapeCSV(full);
    });
    rows.push(cells.join(','));
  }

  const csv = rows.join('\n');
  fs.writeFileSync(outputPath, csv, 'utf-8');
  console.log(`CSV exported to ${outputPath}`);
}

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('\n') || value.includes('"')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
