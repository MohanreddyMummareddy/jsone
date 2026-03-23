# jsone — Troubleshooting Guide

Having issues? This guide covers the most common problems and solutions.

---

## Installation & Setup

### `npm install` fails with permission error
**Problem**: `npm ERR! code EACCES` or permission denied  
**Solution**:
```bash
# On Windows (run as Administrator)
# Or on macOS/Linux:
sudo npm install
```

### `npm command not found`
**Problem**: npm is not installed or not in PATH  
**Solution**:
```bash
# Install Node.js from https://nodejs.org/
# Then verify installation:
node --version
npm --version

# On Windows, add Node to PATH:
# Settings → Edit Environment Variables → Path → Add Node.js folder
```

### Package dependencies don't resolve
**Problem**: `ERR_MODULE_NOT_FOUND` or "Cannot find module"  
**Solution**:
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install

# Or clean and rebuild
npm run clean
npm run build
```

---

## Building

### Build fails with TypeScript errors
**Problem**: `error TS2345: Argument of type...` or similar  
**Solution**:
```bash
# Check TypeScript version
npm list typescript

# Rebuild with clean slate
npm run clean
npm run build

# Or compile specific package
npm run build:core
```

### Terser/minification error during viewer build
**Problem**: `Error: Cannot find module 'terser'`  
**Solution**: The issue was already fixed. If it recurs:
```bash
# Rebuild viewer specifically
npm run build:viewer

# If still failing, check vite.config.ts has no 'terser' reference
```

### `package.json` has unknown properties error
**Problem**: "Unknown property 'workspace' in package.json"  
**Solution**: This is just a linter warning. npm workspaces are valid and working. Ignore the warning or disable in your editor.

---

## Testing

### Too few tests run or import errors in tests
**Problem**: `Cannot find module ./types` or only 1 test runs  
**Solution**:
```bash
# Tests must import with .js extensions for ES modules
# This has been fixed in committed code
# If you modified imports, add .js extensions:
import { parseJsone } from './parse.js'  // ✓ Correct
import { parseJsone } from './parse'     // ✗ Wrong
```

### TypeScript compilation error: `srcDir` is invalid
**Problem**: `error TS6258: Unknown compiler option 'srcDir'`  
**Solution**: This option doesn't exist in tsc. Remove it from tsconfig.json:
```json
// ✓ CORRECT:
{
  "compilerOptions": { "outDir": "dist" },
  "include": ["src/**/*"]
}

// ✗ WRONG:
{
  "compilerOptions": { "srcDir": "src", "outDir": "dist" }
}
```

---

## CLI Tool

### CLI command not found
**Problem**: `command not found: jsone` or `npm run cli` doesn't work  
**Solution**:
```bash
# Use npm run from root
npm run cli table examples/users.jsone

# Or build cli and run directly
npm run build:cli
node cli/dist/cli.js table examples/users.jsone

# Or link globally (after build)
npm link -g cli
jsone table examples/users.jsone
```

### CLI output looks weird (misaligned columns)
**Problem**: Table columns are not aligned  
**Solution**:
```bash
# Ensure terminal width is sufficient (should be 80+ chars)
# If using narrow terminal, resize to larger width

# Or check file is valid JSON:
npm run cli validate examples/users.jsone
```

### CSV export produces invalid file
**Problem**: CSV file has corrupted data or wrong encoding  
**Solution**:
```bash
# Make sure to specify output file with -o flag
npm run cli csv data.jsone -o output.csv

# Check file was created
ls -la output.csv

# View contents
cat output.csv

# Should see standard CSV format with quoted fields
```

---

## Web Viewer

### Dev server won't start
**Problem**: Port already in use or build fails  
**Solution**:
```bash
# Build viewer first
npm run build:viewer

# Start dev server
npm run dev:viewer

# If port 5173 is busy, Vite will use next available port
# Check console output for actual URL
```

### File upload doesn't work
**Problem**: "Drop file here" area doesn't accept files  
**Solution**:
- Only drag-and-drop `.jsone`, `.json`, or `.txt` files
- Files must be valid JSON or jsone format
- Check browser console for error messages (F12)
- Large files (>10MB) may not load

### Table shows as tree instead of table
**Problem**: Data rendered as collapsible tree, not table  
**Solution** The data might not be an array of objects:
```bash
# Validate the file structure
npm run cli validate data.jsone

# jsone looks for the FIRST array of objects
# Make sure your data has this structure:
{
  "data": [
    { "id": 1, "name": "Alice" },
    { "id": 2, "name": "Bob" }
  ]
}
```

### Search/sort not working
**Problem**: Search field doesn't filter or sort doesn't work  
**Solution**:
- Clear browser cache (Ctrl+Shift+Delete)
- Hard refresh page (Ctrl+Shift+R)
- Check browser console for JavaScript errors (F12)
- Try different file or sample data

### CSV export doesn't download
**Problem**: No download dialog appears  
**Solution**:
- Check if browser blocked the download
- Try disabling browser extensions (especially ad blockers)
- Try in different browser
- Look for download in browser's download folder

---

## VS Code Extension

### Extension won't activate
**Problem**: `.jsone` files open as text, not table viewer  
**Solution**:
```bash
# Build the extension
npm run build:ext

# From within extensions/vscode-jsone/:
# Press F5 to open debug window
# Extension should auto-activate for `.jsone` files

# If it doesn't:
# 1. Check package.json has "activationEvents": ["onCustomEditor:jsone.editor"]
# 2. Reload VS Code window (Cmd+R)
# 3. Check Output panel for errors (View → Output)
```

### Type errors in VS Code
**Problem**: Red squiggles in extension source files  
**Solution**:
```bash
# Install dependencies
npm install

# The types are already correct, might be VS Code cache issue
# Restart VS Code or reload window (Cmd+R)

# Verify build works
npm run build:ext
```

### Webview shows blank or errors
**Problem**: Custom editor opens but shows no content  
**Solution**:
- Check browser console in webview (press F12 in VS Code)
- Verify viewer HTML file exists: `extensions/vscode-jsone/media/viewer.html`
- Check file path is readable and valid JSON/jsone
- Try `npm run build:ext` to rebuild with current code

### Changes to `.jsone` file don't refresh
**Problem**: Modified file content, but table doesn't update  
**Solution**:
```bash
# Extension should auto-refresh, but if not:
# 1. Save the file (Cmd+S)
# 2. Check document state (if dirty, file wasn't saved properly)
# 3. Close and reopen the file
# 4. If still broken, restart VS Code debug window (F5 again)
```

---

## Common Data Format Issues

### "No array of objects found"
**Problem**: jsone can't find data to display as table  
**Reason**: File doesn't have an array-of-objects structure
**Solution**:
```json
// ✓ WORKS (array at root)
[
  { "id": 1, "name": "Alice" },
  { "id": 2, "name": "Bob" }
]

// ✓ WORKS (array nested)
{
  "data": [
    { "id": 1, "name": "Alice" },
    { "id": 2, "name": "Bob" }
  ]
}

// ✓ WORKS (multiple nesting levels)
{
  "response": {
    "users": [
      { "id": 1, "name": "Alice" },
      { "id": 2, "name": "Bob" }
    ]
  }
}

// ✗ DOESN'T WORK (no array-of-objects)
{ "id": 1, "name": "Alice" }            // Single object

// ✗ DOESN'T WORK (array of scalars)
["Alice", "Bob", "Charlie"]              // Array of strings

// ✗ DOESN'T WORK (objects without array)
{ "users": { "user1": { name: "Alice" } }} // No array
```

### Columns show `undefined` or `[object Object]`
**Problem**: Complex nested structures don't display properly  
**Solution**: Nested objects are automatically flattened:
```json
{
  "id": 1,
  "user": { "name": "Alice", "email": "alice@example.com" }
}
```
Displays as:
```
id | user.name | user.email
1  | Alice     | alice@example.com
```

Arrays inside objects stop flattening and show as `[array]`:
```json
{
  "id": 1,
  "tags": ["js", "web"]  // Array stops here
}
```
Shows as: `id | tags: [array]`

---

## Performance Issues

### Viewer loads slowly
**Problem**: Large files take time to render  
**Solution**:
- Large files (>10K rows) may be slow in browser
- Use CLI tool for very large datasets: `npm run cli table huge.jsone`
- Consider splitting data into smaller files
- Server-side pagination planned for future versions

### Build takes too long
**Problem**: npm run build takes > 10 seconds  
**Solution**: Normal build is ~500ms. If slower:
```bash
# Clean and rebuild  
npm run clean
npm run build

# Try building individual packages
npm run build:core  # Should be ~200ms
npm run build:viewer  # Should be ~150ms
```

---

## Getting Help

### Check logs
```bash
# Build output with details
npm run build 2>&1 | tee build.log

# Test output with details
npm test -- --reporter=verbose

# CLI debug mode (if added)
DEBUG=jsone npm run cli table data.jsone
```

### Validate your data
```bash
# Always verify files with validator
npm run cli validate examples/users.jsone

# Also try with command-line tools
jq . data.json  # Pretty-print JSON

# Check file is valid
file data.jsone
```

### Check file sizes
```bash
# Compare package sizes
ls -lh extensions/vscode-jsone/out/
ls -lh viewer/dist/
ls -lh cli/dist/
```

### Search known issues
- GitHub Issues: https://github.com/yourusername/jsone/issues
- Check closed issues (already fixed)
- Search for your error message

### Report a bug
1. Try the troubleshooting steps above
2. Check GitHub issues for duplicates
3. Provide:
   - Error message (full text)
   - Steps to reproduce
   - Sample data file
   - Output of `npm --version` and `node --version`
   - Operating system

---

## Windows-Specific Issues

### PowerShell won't run npm
**Problem**: `npm : The term 'npm' is not recognized`  
**Solution**:
```powershell
# Run PowerShell as Administrator
# Then:
Set-ExecutionPolicy RemoteSigned

# Or use regular Command Prompt (cmd) instead
```

### File paths with spaces
**Problem**: `Cannot find file` when path has spaces  
**Solution**: Quote the path:
```bash
npm run cli table "path/with spaces/file.jsone"
```

### Line endings (CRLF vs LF)
**Problem**: Git keeps showing file changes  
**Solution**:
```bash
# Set git to normalize line endings
git config --global core.autocrlf true

# For existing repo
git add --renormalize .
git commit -m "Normalize line endings"
```

---

## macOS/Linux-Specific Issues

### Permission denied on npm install
**Problem**: `npm ERR! code EACCES`  
**Solution**:
```bash
# Use sudo with caution:
sudo npm install -g npm

# Better: use nvm (Node Version Manager)
# https://github.com/nvm-sh/nvm
```

### "Command not found: node"
**Problem**: Node installed but not accessible  
**Solution**:
```bash
# Check if installed
which node

# If not found, install via package manager:
# macOS:
brew install node

# Ubuntu/Debian:
sudo apt install nodejs npm

# Fedora/RHEL:
sudo dnf install nodejs npm
```

---

## Still Stuck?

1. **Read CONTRIBUTING.md** — Full development guide
2. **Check SPEC.md** — Data format specification
3. **Review QUICKSTART.md** — Usage examples
4. **Run verbose logging** — See what's happening
5. **Isolate the problem** — Test with example files first
6. **Ask for help** — GitHub Issues or Discussions

---

## Quick Sanity Checks

Before reporting a bug, verify:

```bash
# ✓ npm and Node work
npm --version && node --version

# ✓ Dependencies installed
ls node_modules | head

# ✓ Build succeeds
npm run build 2>&1 | grep -i error

# ✓ Tests pass
npm test 2>&1 | grep -i "passed\|failed"

# ✓ CLI works
npm run cli table examples/users.jsone

# ✓ Viewer builds
npm run build:viewer && ls -l viewer/dist/
```

All green? You're good to go! ✅

---

**Last Updated**: 2024  
**jsone Version**: 0.4.0  
**Need more help?** → https://github.com/yourusername/jsone/issues
