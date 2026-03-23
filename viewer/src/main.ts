/**
 * Main entry point for jsone viewer
 */

console.log('[main.ts] Module loading...');

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

  console.log('[init] DOM elements found:', {
    fileInput: !!fileInput,
    searchInput: !!searchInput,
    tableViewBtn: !!tableViewBtn,
    treeViewBtn: !!treeViewBtn,
    copyCSVBtn: !!copyCSVBtn,
    tableContainer: !!tableContainer,
    treeContainer: !!treeContainer,
    tableSelector: !!tableSelector,
    downloadJsoneBtn: !!downloadJsoneBtn
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
    console.error('[processJsonData] Full error:', err);
    showMessage(`Error: ${errMsg}`, 'error');
  }
}

init();

// Listen for custom loadExample event from example buttons
console.log('[main.ts] Setting up loadExample event listener');
document.addEventListener('loadExample', (event: Event) => {
  console.log('[main.ts] loadExample event received:', event);
  const customEvent = event as CustomEvent;
  console.log('[main.ts] Custom event detail type:', typeof customEvent.detail);
  console.log('[main.ts] Custom event detail length:', customEvent.detail?.length);
  console.log('[main.ts] Custom event detail (first 100 chars):', customEvent.detail?.substring(0, 100));
  processJsonData(customEvent.detail);
});
