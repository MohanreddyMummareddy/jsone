/**
 * Validate command: validate jsone file structure
 */

import fs from 'fs';
import { parseJsone, Meta, ViewDef } from '@jsone/core';

export async function cmdValidate(filePath: string): Promise<void> {
  let content: string;
  try {
    content = fs.readFileSync(filePath, 'utf-8');
  } catch (err) {
    console.error(`Error reading file: ${filePath}`);
    process.exit(1);
  }

  // Parse JSON
  let parsed: any;
  try {
    parsed = parseJsone(content);
  } catch (err) {
    console.error(`Invalid JSON: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }

  // Validate $meta if present
  if (parsed.meta) {
    validateMeta(parsed.meta);
  }

  console.log(`✓ ${filePath} is valid`);
}

function validateMeta(meta: Meta): void {
  if (!meta.views) {
    return;
  }

  if (!Array.isArray(meta.views)) {
    throw new Error('$meta.views must be an array');
  }

  for (const view of meta.views) {
    validateView(view);
  }
}

function validateView(view: ViewDef): void {
  if (!view.id || typeof view.id !== 'string') {
    throw new Error('Each view in $meta.views must have an "id" property (string)');
  }

  if (view.source && typeof view.source !== 'string') {
    throw new Error(`View "${view.id}": "source" must be a string if provided`);
  }

  if (view.type && typeof view.type !== 'string') {
    throw new Error(`View "${view.id}": "type" must be a string if provided`);
  }

  // Check for no execution fields (e.g., "command", "script", "eval")
  const prohibitedFields = ['command', 'script', 'eval', 'execute', 'run'];
  for (const field of prohibitedFields) {
    if (field in view) {
      throw new Error(
        `View "${view.id}": execution field "${field}" is not allowed for security reasons`
      );
    }
  }

  if (view.columns) {
    if (!Array.isArray(view.columns)) {
      throw new Error(`View "${view.id}": "columns" must be an array if provided`);
    }
    for (const col of view.columns) {
      if (!col.key || typeof col.key !== 'string') {
        throw new Error(`View "${view.id}": each column must have a "key" property (string)`);
      }
    }
  }
}
