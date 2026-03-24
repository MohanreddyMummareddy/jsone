#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { tableFromJsone } from '@mummareddy_mohanreddy/jsone-core';

interface CliOptions {
  format: 'table' | 'csv' | 'json';
  output?: string;
  help: boolean;
  version: boolean;
}

function printHelp(): void {
  console.log(`
jsone - JSON Enhanced CLI

USAGE:
  jsone <command> [options] [file]

COMMANDS:
  convert <file>    Convert JSON/jsone to table format
  analyze <file>    Show statistics about the data
  help              Show this help message
  version           Show version

OPTIONS:
  --format, -f      Output format: table, csv, json (default: table)
  --output, -o      Output file path (default: stdout)
  --help, -h        Show this help message
  --version, -v     Show version

EXAMPLES:
  jsone convert data.json
  jsone convert data.json --format csv --output table.csv
  jsone analyze users.jsone
  `);
}

function printVersion(): void {
  const packageJson = JSON.parse(
    fs.readFileSync(
      path.join(path.dirname(new URL(import.meta.url).pathname), '../package.json'),
      'utf-8'
    )
  );
  console.log(`jsone-cli v${packageJson.version}`);
}

function formatAsTable(rows: any[], columns: string[]): string {
  if (rows.length === 0) return 'No data';

  const colWidths: Record<string, number> = {};
  
  // Calculate column widths
  columns.forEach(col => {
    colWidths[col] = col.length;
    rows.forEach(row => {
      const val = String(row[col] ?? '');
      colWidths[col] = Math.max(colWidths[col], val.length);
    });
  });

  // Build table
  const separator = columns
    .map(col => '-'.repeat(colWidths[col] + 2))
    .join('|');

  const header = columns
    .map(col => ` ${col.padEnd(colWidths[col])} `)
    .join('|');

  const body = rows
    .map(row =>
      columns
        .map(col => {
          const val = String(row[col] ?? '');
          return ` ${val.padEnd(colWidths[col])} `;
        })
        .join('|')
    )
    .join('\n');

  return `${separator}\n${header}\n${separator}\n${body}\n${separator}`;
}

function formatAsCSV(rows: any[], columns: string[]): string {
  const escaped = (val: any) => {
    const str = String(val ?? '');
    return str.includes(',') || str.includes('"') || str.includes('\n')
      ? `"${str.replace(/"/g, '""')}"`
      : str;
  };

  const header = columns.map(escaped).join(',');
  const body = rows
    .map(row => columns.map(col => escaped(row[col])).join(','))
    .join('\n');

  return `${header}\n${body}`;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    printHelp();
    process.exit(0);
  }

  const command = args[0];

  if (command === 'help' || command === '-h' || command === '--help') {
    printHelp();
    process.exit(0);
  }

  if (command === 'version' || command === '-v' || command === '--version') {
    printVersion();
    process.exit(0);
  }

  if (command !== 'convert' && command !== 'analyze') {
    console.error(`Unknown command: ${command}`);
    console.error('Use "jsone help" for usage information');
    process.exit(1);
  }

  const filePath = args[1];

  if (!filePath) {
    console.error('Error: File path required');
    console.error('Use "jsone help" for usage information');
    process.exit(1);
  }

  try {
    // Read and parse file
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    let data: any;

    try {
      data = JSON.parse(fileContent);
    } catch (e) {
      console.error(`Error: Invalid JSON in ${filePath}`);
      process.exit(1);
    }

    // Parse options
    const options: CliOptions = {
      format: 'table',
      help: false,
      version: false
    };

    for (let i = 2; i < args.length; i++) {
      if (args[i] === '--format' || args[i] === '-f') {
        options.format = args[++i] as 'table' | 'csv' | 'json';
      } else if (args[i] === '--output' || args[i] === '-o') {
        options.output = args[++i];
      }
    }

    // Handle commands
    if (command === 'analyze') {
      const result = tableFromJsone(data);
      console.log(`
Data Analysis:
  Total rows: ${result.rows.length}
  Columns: ${result.columns.length} (${result.columns.join(', ')})
  File: ${filePath}
      `);
      process.exit(0);
    }

    if (command === 'convert') {
      const result = tableFromJsone(data);
      let output: string;

      if (options.format === 'csv') {
        output = formatAsCSV(result.rows, result.columns);
      } else if (options.format === 'json') {
        output = JSON.stringify(result.rows, null, 2);
      } else {
        output = formatAsTable(result.rows, result.columns);
      }

      if (options.output) {
        fs.writeFileSync(options.output, output);
        console.log(`✓ Exported to ${options.output}`);
      } else {
        console.log(output);
      }
    }
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
