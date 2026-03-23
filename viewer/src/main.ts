/**
 * Main entry point for jsone viewer
 */

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

let currentState: any = null;
let currentJsone: any = null;
let availableTables: TableSource[] = [];
let selectedTableIndex = 0;

function init(): void {
  const fileInput = $('#fileInput') as HTMLInputElement;
  const searchInput = $('#searchInput') as HTMLInputElement;
  const tableViewBtn = $('#tableViewBtn');
  const treeViewBtn = $('#treeViewBtn');
  const copyCSVBtn = $('#copyCSVBtn') as HTMLButtonElement;
  const tableContainer = $('#tableContainer');
  const treeContainer = $('#treeContainer');
  const tableSelector = $('#tableSelector');
  const downloadJsoneBtn = $('#downloadJsoneBtn');

  if (!fileInput) return;

  // File input handler
  on(fileInput, 'change', async (e) => {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      processJsonData(text);
      showMessage('File loaded successfully!', 'success');
    } catch (err) {
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
    const parsed = parseJsone(jsonStr);
    currentJsone = parsed;
    const tableContainer = $('#tableContainer');
    const tableViewBtn = $('#tableViewBtn');
    const treeViewBtn = $('#treeViewBtn');
    const downloadJsoneBtn = $('#downloadJsoneBtn') as HTMLButtonElement;

    // Find all tabular representations
    availableTables = findAllTableSources(parsed.data);

    // Always get a table (coerced if needed)
    const table = tableFromJsone(parsed.data);
    currentState = createTableState(table);

    // Show table information if multiple tables found
    if (availableTables.length > 1) {
      showMessage(`Found ${availableTables.length} tables in this JSON! Use dropdown to switch.`, 'success');
    }

    // Render the table
    if (tableContainer) {
      renderTable(tableContainer, currentState, (key, value) => {
        showCellModal(key, value);
      });
    }

    // Show table by default
    if (tableContainer) {
      const treeContainer = $('#treeContainer');
      if (treeContainer) {
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
    }
  } catch (err) {
    showMessage(`Error: ${err instanceof Error ? err.message : String(err)}`, 'error');
  }
}

init();

// Listen for custom loadExample event from example buttons
document.addEventListener('loadExample', (event: Event) => {
  const customEvent = event as CustomEvent;
  processJsonData(customEvent.detail);
});
