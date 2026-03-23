#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const distDir = join(__dirname, '..', 'dist');

// Dynamically import the CLI
import(join(distDir, 'cli.js')).catch((err) => {
  console.error('Error loading CLI:', err.message);
  process.exit(1);
});
