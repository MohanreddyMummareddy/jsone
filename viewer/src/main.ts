/**
 * Main entry point for jsone viewer
 */

console.log('[main.ts] Module loading...');

// Global log capture system
const logs: any[] = [];
const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;

// Capture all logs
console.log = function(...args: any[]): void {
  const timestamp = new Date().toISOString();
  logs.push({ type: 'log', timestamp, message: args.join(' ') });
  originalLog.apply(console, args);
};

console.error = function(...args: any[]): void {
  const timestamp = new Date().toISOString();
  logs.push({ type: 'error', timestamp, message: args.join(' ') });
  originalError.apply(console, args);
};

console.warn = function(...args: any[]): void {
  const timestamp = new Date().toISOString();
  logs.push({ type: 'warn', timestamp, message: args.join(' ') });
  originalWarn.apply(console, args);
};

// Make logs globally accessible
(window as any).__JSONE_LOGS = logs;

console.log('[main.ts] Log capture system initialized');

import { 
  parseJsone, 
  tableFromJsone, 
  findAllTableSources, 
  type TableSource,
  repairJSON,
  validateJSON,
  minifyJSON,
  prettyJSON,
  compactJSON,
  formatJSON,
  getFormattingStats,
  diffJSON,
  generateDiffReport,
  jsonToYAML,
  yamlToJSON,
  query,
  getValue,
  validate,
  inferSchema,
  generateValidationReport
} from '@jsone/core';
import {
  $,
  on,
  show,
  hide,
  clear,
  setText,
  addClass,
  removeClass,
  hasClass,
  copyToClipboard,
  el,
} from './dom';
import {
  createTableState,
  renderTable,
  renderTreeView,
  updateSearch,
  exportTableToCSV,
  showCellModal,
  showMessage,
} from './table';
import { escapeHtml } from './utils';

console.log('[main.ts] Imports completed successfully');

let currentState: any = null;
let currentJsone: any = null;
let availableTables: TableSource[] = [];
let selectedTableIndex = 0;

function init(): void {
  console.log('[init] Starting initialization');
  const fileInput = $('#fileInput') as HTMLInputElement;
  const searchInput = $('#searchInput') as HTMLInputElement;
  const tableViewBtn = $('#tableViewBtn');
  const treeViewBtn = $('#treeViewBtn');
  const copyCSVBtn = $('#copyCSVBtn') as HTMLButtonElement;
  const tableContainer = $('#tableContainer');
  const treeContainer = $('#treeContainer');
  const tableSelector = $('#tableSelector');
  const downloadJsoneBtn = $('#downloadJsoneBtn');
  const homeBtn = $('#homeBtn');
  const downloadLogsBtn = $('#downloadLogsBtn');

  console.log('[init] DOM elements found:', {
    fileInput: !!fileInput,
    searchInput: !!searchInput,
    tableViewBtn: !!tableViewBtn,
    treeViewBtn: !!treeViewBtn,
    copyCSVBtn: !!copyCSVBtn,
    tableContainer: !!tableContainer,
    treeContainer: !!treeContainer,
    tableSelector: !!tableSelector,
    downloadJsoneBtn: !!downloadJsoneBtn,
    homeBtn: !!homeBtn,
    downloadLogsBtn: !!downloadLogsBtn
  });

  if (!fileInput) {
    console.error('[init] fileInput not found, aborting');
    return;
  }

  // File input handler
  on(fileInput, 'change', async (e) => {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    console.log('[main.ts] File input changed');
    console.log('[main.ts] Files:', input.files);
    console.log('[main.ts] First file:', file);
    if (!file) {
      console.error('[main.ts] No file selected');
      return;
    }

    try {
      console.log('[main.ts] Reading file...');
      const text = await file.text();
      console.log('[main.ts] File text length:', text.length);
      console.log('[main.ts] First 100 chars:', text.substring(0, 100));
      processJsonData(text);
      showMessage('File loaded successfully!', 'success');
    } catch (err) {
      console.error('[main.ts] Error reading file:', err);
      showMessage(`Error reading file: ${err instanceof Error ? err.message : String(err)}`, 'error');
    }
  });

  // Pasted JSON handler
  document.addEventListener('pastedJSON', (e: any) => {
    console.log('[main.ts] Pasted JSON event received');
    const jsonText = e.detail;
    try {
      processJsonData(jsonText);
      // Show home button
      if (homeBtn) {
        homeBtn.style.display = 'block';
      }
      showMessage('JSON loaded from paste!', 'success');
    } catch (err) {
      console.error('[main.ts] Error processing pasted JSON:', err);
      showMessage(`Error processing JSON: ${err instanceof Error ? err.message : String(err)}`, 'error');
    }
  });

  // Also set up direct handler for fallback
  (window as any).__handlePastedJSON = (jsonText: string) => {
    console.log('[main.ts] Direct pasted JSON handler called');
    try {
      processJsonData(jsonText);
      if (homeBtn) {
        homeBtn.style.display = 'block';
      }
      showMessage('JSON loaded from paste!', 'success');
    } catch (err) {
      console.error('[main.ts] Error processing pasted JSON:', err);
      showMessage(`Error processing JSON: ${err instanceof Error ? err.message : String(err)}`, 'error');
    }
  };

  // View toggle
  if (tableViewBtn && treeViewBtn && tableContainer && treeContainer) {
    on(tableViewBtn, 'click', () => {
      addClass(tableViewBtn, 'active');
      removeClass(treeViewBtn, 'active');
      show(tableContainer);
      hide(treeContainer);
    });

    on(treeViewBtn, 'click', () => {
      addClass(treeViewBtn, 'active');
      removeClass(tableViewBtn, 'active');
      hide(tableContainer);
      show(treeContainer);

      // Render tree view when shown
      if (currentState) {
        renderTreeView(treeContainer, currentJsone.data);
      }
    });
  }

  // Home button - return to landing page
  if (homeBtn) {
    console.log('[init] Setting up home button');
    on(homeBtn, 'click', () => {
      console.log('[init] Home button clicked');
      const landingSection = document.getElementById('landingSection');
      const appSection = document.getElementById('appSection');
      if (landingSection && appSection) {
        landingSection.style.display = 'flex';
        appSection.style.display = 'none';
        // Hide home button when returning to landing
        homeBtn.style.display = 'none';
        // Reset form
        if (fileInput) {
          fileInput.value = '';
        }
        // Reset state
        currentState = null;
        currentJsone = null;
        if (tableContainer) {
          clear(tableContainer);
          setText(tableContainer, '📁 Load a .jsone or .json file to view');
        }
        console.log('[init] Returned to landing page');
      }
    });
  }

  // Download logs button
  if (downloadLogsBtn) {
    console.log('[init] Setting up download logs button');
    on(downloadLogsBtn, 'click', () => {
      console.log('[init] Download logs button clicked');
      const logsData = (window as any).__JSONE_LOGS || [];
      const logsText = logsData.map((log: any) => `[${log.timestamp}] [${log.type.toUpperCase()}] ${log.message}`).join('\n');
      const blob = new Blob([logsText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `jsone-logs-${new Date().toISOString().replace(/[:.]/g, '-')}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      console.log('[init] Logs downloaded:', logsData.length, 'entries');
    });
  }

  // Modal close
  const modal = document.getElementById('expandModal');
  if (modal) {
    on(modal, 'click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  }
}

function renderTableSelector(container: HTMLElement): void {
  clear(container);
  const label = el('label', {}, ['Choose table:']);
  const select = document.createElement('select') as HTMLSelectElement;

  availableTables.forEach((table, index) => {
    const option = document.createElement('option') as HTMLOptionElement;
    option.value = String(index);
    option.textContent = `${table.path} (${table.rowCount} rows, ${table.columnCount} cols)`;
    if (index === 0) option.selected = true;
    select.appendChild(option);
  });

  on(select, 'change', (e) => {
    const index = parseInt((e.target as HTMLSelectElement).value);
    selectedTableIndex = index;
    const tableContainer = $('#tableContainer');
    const searchInput = $('#searchInput') as HTMLInputElement;
    const copyCSVBtn = $('#copyCSVBtn') as HTMLButtonElement;
    loadTableByIndex(index, tableContainer, searchInput, copyCSVBtn);
  });

  container.appendChild(label);
  container.appendChild(select);
}

function loadTableByIndex(
  index: number,
  tableContainer: HTMLElement | null,
  searchInput: HTMLInputElement | null,
  copyCSVBtn: HTMLButtonElement | null
): void {
  if (index >= availableTables.length) return;

  const table = availableTables[index];
  const tableData = tableFromJsone(table.array);
  currentState = createTableState(tableData);

  if (tableContainer) {
    renderTable(tableContainer, currentState, (key, value) => {
      showCellModal(key, value);
    });
  }

  if (searchInput) {
    searchInput.value = '';
    on(searchInput, 'input', (se) => {
      const query = (se.target as HTMLInputElement).value;
      if (currentState) {
        updateSearch(currentState, query);
        if (tableContainer && !hasClass($('#treeContainer') || { classList: { contains: () => false } }, 'hidden')) {
          renderTable(tableContainer, currentState, (key, value) => {
            showCellModal(key, value);
          });
        }
      }
    });
  }

  if (copyCSVBtn) {
    copyCSVBtn.disabled = false;
    on(copyCSVBtn, 'click', () => {
      if (currentState) {
        const csv = exportTableToCSV(currentState);
        copyToClipboard(csv).then(() => {
          showMessage('CSV copied to clipboard!', 'success');
        });
      }
    });
  }
}

function downloadAsJsone(): void {
  if (!currentJsone || !currentState) return;

  // Build the jsone file with metadata
  const jsoneContent = {
    $meta: {
      title: prompt('Enter title for this table:', 'My Data') || 'My Data',
      views: [
        {
          id: 'primary',
          source: availableTables[selectedTableIndex].path === '[root]' ? undefined : availableTables[selectedTableIndex].path,
          columns: currentState.data.columns.map((col: any) => ({
            key: col.key,
            label: col.label,
            type: col.type,
          })),
        },
      ],
    },
    ...currentJsone.data,
  };

  const jsoneString = JSON.stringify(jsoneContent, null, 2);
  const blob = new Blob([jsoneString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'data.jsone';
  a.click();
  URL.revokeObjectURL(url);

  showMessage('Downloaded as .jsone file!', 'success');
}

function processJsonData(jsonStr: string): void {
  try {
    console.log('[processJsonData] Starting with JSON string length:', jsonStr.length);
    console.log('[processJsonData] First 100 chars:', jsonStr.substring(0, 100));
    
    // Show app section and home button
    const landingSection = document.getElementById('landingSection');
    const appSection = document.getElementById('appSection');
    const homeBtn = document.getElementById('homeBtn');
    
    if (landingSection && appSection) {
      console.log('[processJsonData] Hiding landing, showing app');
      landingSection.style.display = 'none';
      appSection.style.display = 'block';
    }
    
    if (homeBtn) {
      console.log('[processJsonData] Showing home button');
      homeBtn.style.display = 'block';
    }
    
    const parsed = parseJsone(jsonStr);
    console.log('[processJsonData] Parsed successfully:', parsed);
    currentJsone = parsed;
    
    const tableContainer = $('#tableContainer');
    const tableViewBtn = $('#tableViewBtn');
    const treeViewBtn = $('#treeViewBtn');
    const downloadJsoneBtn = $('#downloadJsoneBtn') as HTMLButtonElement;
    
    console.log('[processJsonData] DOM elements found:', {
      tableContainer: !!tableContainer,
      tableViewBtn: !!tableViewBtn,
      treeViewBtn: !!treeViewBtn,
      downloadJsoneBtn: !!downloadJsoneBtn
    });

    // Find all tabular representations
    console.log('[processJsonData] Calling findAllTableSources...');
    availableTables = findAllTableSources(parsed.data);
    console.log('[processJsonData] Available tables:', availableTables.length, availableTables);

    // Always get a table (coerced if needed)
    console.log('[processJsonData] Calling tableFromJsone...');
    const table = tableFromJsone(parsed.data);
    console.log('[processJsonData] Table result:', table);
    
    currentState = createTableState(table);
    console.log('[processJsonData] Current state created:', currentState);

    // Show table information if multiple tables found
    if (availableTables.length > 1) {
      console.log('[processJsonData] Multiple tables found:', availableTables.length);
      showMessage(`Found ${availableTables.length} tables in this JSON! Use dropdown to switch.`, 'success');
    }

    // Render the table
    if (tableContainer) {
      console.log('[processJsonData] Rendering table...');
      renderTable(tableContainer, currentState, (key, value) => {
        showCellModal(key, value);
      });
      console.log('[processJsonData] Table rendered');
    } else {
      console.error('[processJsonData] tableContainer not found!');
    }

    // Show table by default
    if (tableContainer) {
      const treeContainer = $('#treeContainer');
      if (treeContainer) {
        console.log('[processJsonData] Showing table, hiding tree');
        show(tableContainer);
        hide(treeContainer);
        if (tableViewBtn && treeViewBtn) {
          addClass(tableViewBtn, 'active');
          removeClass(treeViewBtn, 'active');
        }
      }
    }

    // Enable download button and utilities
    if (downloadJsoneBtn) {
      downloadJsoneBtn.disabled = false;
      console.log('[processJsonData] Download button enabled');
    }
    
    // Show utilities button
    const utilitiesBtn = $('#utilitiesToggle') as HTMLButtonElement;
    if (utilitiesBtn) {
      utilitiesBtn.style.display = 'block';
      console.log('[processJsonData] Utilities button shown');
    }
    
    console.log('[processJsonData] Processing complete');
  } catch (err) {
    console.error('[processJsonData] Error:', err);
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error('[processJsonData] Error message:', errMsg);
    console.error('[processJsonData] Stack:', err instanceof Error ? err.stack : 'N/A');
    console.error('[processJsonData] Full error:', err);
    showMessage(`Error: ${errMsg}`, 'error');
  }
}

// ============================================================================
// UTILITY FUNCTIONS - UI HANDLERS
// ============================================================================

(window as any).toggleUtilities = function() {
  console.log('[toggleUtilities] Called');
  const modal = document.getElementById('utilitiesModal') as HTMLElement;
  if (modal) {
    modal.classList.toggle('active');
    // Reset to first tab when opening
    if (modal.classList.contains('active')) {
      switchUtilityTab('repair');
    }
    console.log('[toggleUtilities] Utilities modal toggled');
  }
};

(window as any).switchUtilityTab = function(tabName: string) {
  console.log('[switchUtilityTab] Switching to:', tabName);
  
  // Show the content area
  const contentArea = document.getElementById('utilityContentArea') as HTMLElement;
  if (contentArea) {
    contentArea.style.display = 'block';
  }
  
  // Hide all content tabs
  const allContent = document.querySelectorAll('.utility-content');
  allContent.forEach(el => el.classList.remove('active'));
  
  // Show selected content
  const contentEl = document.getElementById(`${tabName}-content`);
  if (contentEl) {
    contentEl.classList.add('active');
  }
};

(window as any).updateFormatPreview = function() {
  console.log('[updateFormatPreview] Called');
  // This is called when format options change
};

(window as any).utilityRepairJSON = function() {
  console.log('[utilityRepairJSON] Called');
  try {
    if (!currentJsone) {
      showMessage('No JSON loaded', 'error');
      return;
    }
    const repaired = repairJSON(JSON.stringify(currentJsone.data));
    const resultEl = document.getElementById('repair-result');
    if (resultEl) {
      const parsed = JSON.parse(repaired);
      resultEl.innerHTML = `<div class="result-box success">${escapeHtml(JSON.stringify(parsed, null, 2))}</div>`;
      copyToClipboard(repaired).then(() => {
        showMessage('Repaired JSON copied to clipboard!', 'success');
      });
    }
  } catch (err) {
    console.error('[utilityRepairJSON] Error:', err);
    const resultEl = document.getElementById('repair-result');
    if (resultEl) {
      resultEl.innerHTML = `<div class="result-box error">${escapeHtml(String(err))}</div>`;
    }
    showMessage(`Error: ${err instanceof Error ? err.message : String(err)}`, 'error');
  }
};

(window as any).utilityValidateJSON = function() {
  console.log('[utilityValidateJSON] Called');
  try {
    if (!currentJsone) {
      showMessage('No JSON loaded', 'error');
      return;
    }
    const validation = validateJSON(JSON.stringify(currentJsone.data));
    const resultEl = document.getElementById('repair-result');
    if (resultEl) {
      const msg = validation.isValid ? '✓ Valid JSON' : '✗ Invalid JSON: ' + validation.error;
      resultEl.innerHTML = `<div class="result-box ${validation.isValid ? 'success' : 'error'}">${msg}</div>`;
    }
    showMessage(validation.isValid ? 'JSON is valid!' : `Invalid: ${validation.error}`, validation.isValid ? 'success' : 'error');
  } catch (err) {
    console.error('[utilityValidateJSON] Error:', err);
    showMessage(`Error: ${err instanceof Error ? err.message : String(err)}`, 'error');
  }
};

(window as any).utilityFormatJSON = function() {
  console.log('[utilityFormatJSON] Called');
  try {
    if (!currentJsone) {
      showMessage('No JSON loaded', 'error');
      return;
    }
    const formatType = (document.getElementById('formatType') as HTMLSelectElement)?.value || 'pretty';
    const indent = parseInt((document.getElementById('formatIndent') as HTMLInputElement)?.value || '2');
    
    let formatted: string;
    const jsonStr = JSON.stringify(currentJsone.data);
    
    if (formatType === 'pretty') {
      formatted = prettyJSON(jsonStr, { indent });
    } else if (formatType === 'minify') {
      formatted = minifyJSON(jsonStr);
    } else {
      formatted = compactJSON(jsonStr);
    }
    
    const resultEl = document.getElementById('format-result');
    if (resultEl) {
      resultEl.innerHTML = `<div class="result-box success">${escapeHtml(formatted)}</div>`;
      copyToClipboard(formatted).then(() => {
        showMessage('Formatted JSON copied to clipboard!', 'success');
      });
    }
  } catch (err) {
    console.error('[utilityFormatJSON] Error:', err);
    const resultEl = document.getElementById('format-result');
    if (resultEl) {
      resultEl.innerHTML = `<div class="result-box error">${escapeHtml(String(err))}</div>`;
    }
  }
};

(window as any).utilityDiffJSON = function() {
  console.log('[utilityDiffJSON] Called');
  try {
    if (!currentJsone) {
      showMessage('No JSON loaded', 'error');
      return;
    }
    const diffText = (document.getElementById('diffJson2') as HTMLTextAreaElement)?.value;
    if (!diffText) {
      showMessage('Please paste JSON to compare', 'error');
      return;
    }
    
    const diff = diffJSON(JSON.stringify(currentJsone.data), diffText);
    const report = generateDiffReport(diff);
    const resultEl = document.getElementById('diff-result');
    if (resultEl) {
      resultEl.innerHTML = `<div class="result-box success"><pre>${escapeHtml(report)}</pre></div>`;
      copyToClipboard(report).then(() => {
        showMessage('Diff report copied!', 'success');
      });
    }
  } catch (err) {
    console.error('[utilityDiffJSON] Error:', err);
    const resultEl = document.getElementById('diff-result');
    if (resultEl) {
      resultEl.innerHTML = `<div class="result-box error">${escapeHtml(String(err))}</div>`;
    }
  }
};

(window as any).utilityJsonToYAML = function() {
  console.log('[utilityJsonToYAML] Called');
  try {
    if (!currentJsone) {
      showMessage('No JSON loaded', 'error');
      return;
    }
    const yaml = jsonToYAML(JSON.stringify(currentJsone.data));
    const resultEl = document.getElementById('yaml-result');
    if (resultEl) {
      resultEl.innerHTML = `<div class="result-box success"><pre>${escapeHtml(yaml)}</pre></div>`;
      copyToClipboard(yaml).then(() => {
        showMessage('YAML copied to clipboard!', 'success');
      });
    }
  } catch (err) {
    console.error('[utilityJsonToYAML] Error:', err);
    const resultEl = document.getElementById('yaml-result');
    if (resultEl) {
      resultEl.innerHTML = `<div class="result-box error">${escapeHtml(String(err))}</div>`;
    }
  }
};

(window as any).utilityYAMLToJSON = function() {
  console.log('[utilityYAMLToJSON] Called');
  try {
    const yamlInput = prompt('Paste your YAML here:');
    if (!yamlInput) return;
    
    const json = yamlToJSON(yamlInput);
    const resultEl = document.getElementById('yaml-result');
    if (resultEl) {
      resultEl.innerHTML = `<div class="result-box success"><pre>${escapeHtml(JSON.stringify(JSON.parse(json), null, 2))}</pre></div>`;
      copyToClipboard(json).then(() => {
        showMessage('JSON copied to clipboard!', 'success');
      });
    }
  } catch (err) {
    console.error('[utilityYAMLToJSON] Error:', err);
    const resultEl = document.getElementById('yaml-result');
    if (resultEl) {
      resultEl.innerHTML = `<div class="result-box error">${escapeHtml(String(err))}</div>`;
    }
  }
};

(window as any).utilityQueryJSON = function() {
  console.log('[utilityQueryJSON] Called');
  try {
    if (!currentJsone) {
      showMessage('No JSON loaded', 'error');
      return;
    }
    const exprInput = (document.getElementById('jsonpathExpr') as HTMLInputElement)?.value;
    if (!exprInput) {
      showMessage('Please enter a JSONPath expression', 'error');
      return;
    }
    
    const result = query(currentJsone.data, exprInput);
    const resultEl = document.getElementById('jsonpath-result');
    if (resultEl) {
      resultEl.innerHTML = `<div class="result-box success"><pre>${escapeHtml(JSON.stringify(result, null, 2))}</pre></div>`;
      copyToClipboard(JSON.stringify(result)).then(() => {
        showMessage('Query result copied!', 'success');
      });
    }
  } catch (err) {
    console.error('[utilityQueryJSON] Error:', err);
    const resultEl = document.getElementById('jsonpath-result');
    if (resultEl) {
      resultEl.innerHTML = `<div class="result-box error">${escapeHtml(String(err))}</div>`;
    }
  }
};

(window as any).utilityValidateSchema = function() {
  console.log('[utilityValidateSchema] Called');
  try {
    if (!currentJsone) {
      showMessage('No JSON loaded', 'error');
      return;
    }
    const schemaText = (document.getElementById('schemaPaste') as HTMLTextAreaElement)?.value;
    if (!schemaText) {
      showMessage('Please paste a JSON schema', 'error');
      return;
    }
    
    const schema = JSON.parse(schemaText);
    const validation = validate(currentJsone.data, schema);
    const resultEl = document.getElementById('schema-result');
    if (resultEl) {
      const report = generateValidationReport(validation);
      resultEl.innerHTML = `<div class="result-box ${validation.valid ? 'success' : 'error'}"><pre>${escapeHtml(report)}</pre></div>`;
      copyToClipboard(report).then(() => {
        showMessage(validation.valid ? 'Validation passed!' : 'Validation failed', validation.valid ? 'success' : 'error');
      });
    }
  } catch (err) {
    console.error('[utilityValidateSchema] Error:', err);
    const resultEl = document.getElementById('schema-result');
    if (resultEl) {
      resultEl.innerHTML = `<div class="result-box error">${escapeHtml(String(err))}</div>`;
    }
  }
};

(window as any).utilityInferSchema = function() {
  console.log('[utilityInferSchema] Called');
  try {
    if (!currentJsone) {
      showMessage('No JSON loaded', 'error');
      return;
    }
    
    const schema = inferSchema(currentJsone.data);
    const resultEl = document.getElementById('schema-result');
    if (resultEl) {
      resultEl.innerHTML = `<div class="result-box success"><pre>${escapeHtml(JSON.stringify(schema, null, 2))}</pre></div>`;
      copyToClipboard(JSON.stringify(schema)).then(() => {
        showMessage('Schema inferred and copied!', 'success');
      });
    }
  } catch (err) {
    console.error('[utilityInferSchema] Error:', err);
    const resultEl = document.getElementById('schema-result');
    if (resultEl) {
      resultEl.innerHTML = `<div class="result-box error">${escapeHtml(String(err))}</div>`;
    }
  }
}

init();

console.log('[main.ts] Setting up loadExample event handling');

// Create handler function that will be called either by event listener or directly
const handleLoadExample = (jsonStr: string) => {
  console.log('[main.ts] handleLoadExample called with jsonStr length:', jsonStr.length);
  processJsonData(jsonStr);
};

// Expose handler globally so inline script can call it directly if needed
(window as any).__handleLoadExample = handleLoadExample;
console.log('[main.ts] Exposed __handleLoadExample globally');

// Set up event listener
document.addEventListener('loadExample', (event: Event) => {
  console.log('[main.ts] loadExample event received:', event);
  const customEvent = event as CustomEvent;
  console.log('[main.ts] Custom event detail type:', typeof customEvent.detail);
  console.log('[main.ts] Custom event detail length:', customEvent.detail?.length);
  console.log('[main.ts] Custom event detail (first 100 chars):', customEvent.detail?.substring(0, 100));
  handleLoadExample(customEvent.detail);
});
console.log('[main.ts] Event listener registered');

// Process any queued events that were buffered before this listener was ready
console.log('[main.ts] Checking for queued events...');
const queue = (window as any).__loadExampleQueue || [];
console.log('[main.ts] Queue length:', queue.length);
while (queue.length > 0) {
  const event = queue.shift();
  console.log('[main.ts] Processing queued event:', event);
  const customEvent = event as CustomEvent;
  handleLoadExample(customEvent.detail);
}
console.log('[main.ts] All queued events processed');

// Import utility functions
export * from './utils';
