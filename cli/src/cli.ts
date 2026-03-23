/**
 * Main CLI entry point
 */

import fs from 'fs';
import path from 'path';
import { cmdTable } from './commands/table.js';
import { cmdCSV } from './commands/csv.js';
import { cmdValidate } from './commands/validate.js';

const args = process.argv.slice(2);

async function main(): Promise<void> {
  if (args.length === 0) {
    printHelp();
    process.exit(0);
  }

  const command = args[0];
  const filePath = args[1];

  try {
    switch (command) {
      case 'table':
        if (!filePath) {
          console.error('Usage: jsone table <file>');
          process.exit(1);
        }
        if (!fs.existsSync(filePath)) {
          console.error(`File not found: ${filePath}`);
          process.exit(1);
        }
        await cmdTable(filePath);
        break;

      case 'csv':
        if (!filePath) {
          console.error('Usage: jsone csv <file> -o <output.csv>');
          process.exit(1);
        }
        if (!fs.existsSync(filePath)) {
          console.error(`File not found: ${filePath}`);
          process.exit(1);
        }

        // Find -o flag
        const oIndex = args.indexOf('-o');
        if (oIndex === -1 || oIndex + 1 >= args.length) {
          console.error('Usage: jsone csv <file> -o <output.csv>');
          process.exit(1);
        }

        const outputPath = args[oIndex + 1];
        await cmdCSV(filePath, outputPath);
        break;

      case 'validate':
        if (!filePath) {
          console.error('Usage: jsone validate <file>');
          process.exit(1);
        }
        if (!fs.existsSync(filePath)) {
          console.error(`File not found: ${filePath}`);
          process.exit(1);
        }
        await cmdValidate(filePath);
        break;

      case '--help':
      case '-h':
        printHelp();
        break;

      case '--version':
      case '-v':
        console.log('jsone 0.4.0');
        break;

      default:
        console.error(`Unknown command: ${command}`);
        console.error('Run "jsone --help" for usage information');
        process.exit(1);
    }
  } catch (err) {
    console.error(`Error: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }
}

function printHelp(): void {
  console.log(`jsone v0.4.0 — JSON Enhanced CLI

Usage:
  jsone table <file>           Pretty-print a table to stdout
  jsone csv <file> -o <out>    Export to CSV
  jsone validate <file>        Validate file structure

Options:
  --help, -h                   Show this help
  --version, -v                Show version

Examples:
  jsone table data.jsone
  jsone csv data.jsone -o data.csv
  jsone validate data.jsone

For more info, visit: https://github.com/yourusername/jsone`);
}

main().catch((err) => {
  console.error(`Fatal error: ${err.message}`);
  process.exit(1);
});
