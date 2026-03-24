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

import { parseJsone, tableFromJsone, findAllTableSources, type TableSource } from '@mummareddy_mohanreddy/jsone-core';
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

    // Enable download button
    if (downloadJsoneBtn) {
      downloadJsoneBtn.disabled = false;
      console.log('[processJsonData] Download button enabled');
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
