/**
 * Table command: pretty-print jsone data as a table to stdout
 */

import fs from 'fs';
import { parseJsone, tableFromJsone } from '@jsone/core';

export async function cmdTable(filePath: string): Promise<void> {
  const content = fs.readFileSync(filePath, 'utf-8');
  const parsed = parseJsone(content);
  const table = tableFromJsone(parsed.data);

  if (table.rows.length === 0) {
    console.log('No table data found');
    return;
  }

  // Calculate column widths
  const colWidths: Record<string, number> = {};
  for (const col of table.columns) {
    colWidths[col.key] = Math.max(
      col.label.length,
      Math.min(40, 8) // min 8, max 40
    );
  }

  // Adjust width based on content
  for (const row of table.rows) {
    for (const col of table.columns) {
      const value = String(row[col.key] || '');
      const truncated = value.length > 40 ? value.substring(0, 37) + '...' : value;
      colWidths[col.key] = Math.max(colWidths[col.key], truncated.length);
    }
  }

  // Print header
  const headerCells = table.columns.map((col) =>
    padString(col.label, colWidths[col.key], 'left')
  );
  console.log(headerCells.join(' | '));
  console.log(
    Array(headerCells.join(' | ').length)
      .fill('-')
      .join('')
  );

  // Print rows
  for (const row of table.rows) {
    const cells = table.columns.map((col) => {
      const value = String(row[col.key] || '');
      const truncated = value.length > 40 ? value.substring(0, 37) + '...' : value;
      return padString(truncated, colWidths[col.key], 'left');
    });
    console.log(cells.join(' | '));
  }
}

function padString(str: string, width: number, align: 'left' | 'right' = 'left'): string {
  const padding = width - str.length;
  if (align === 'left') {
    return str + ' '.repeat(Math.max(0, padding));
  } else {
    return ' '.repeat(Math.max(0, padding)) + str;
  }
}
