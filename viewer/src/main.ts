/**
 * Main entry point for jsone viewer
 */

import { parseJsone, tableFromJsone } from '@jsone/core';
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

function init(): void {
  const fileInput = $('#fileInput') as HTMLInputElement;
  const searchInput = $('#searchInput') as HTMLInputElement;
  const tableViewBtn = $('#tableViewBtn');
  const treeViewBtn = $('#treeViewBtn');
  const copyCSVBtn = $('#copyCSVBtn') as HTMLButtonElement;
  const tableContainer = $('#tableContainer');
  const treeContainer = $('#treeContainer');

  if (!fileInput) return;

  // File input handler
  on(fileInput, 'change', async (e) => {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = parseJsone(text);
      const table = tableFromJsone(parsed.data);

      currentState = createTableState(table);

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
            if (tableContainer && !hasClass(treeContainer || { classList: { contains: () => false } }, 'hidden')) {
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

      // Show table by default
      if (tableContainer && treeContainer) {
        show(tableContainer);
        hide(treeContainer);
      }

      showMessage('File loaded successfully!', 'success');
    } catch (err) {
      showMessage(`Error: ${err instanceof Error ? err.message : String(err)}`, 'error');
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
        renderTreeView(treeContainer, currentState.data.rows);
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

init();
