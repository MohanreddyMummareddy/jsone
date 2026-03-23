/**
 * Table rendering logic for jsone viewer
 */

import { ColumnDef, TableResult, parseJsone, tableFromJsone, formatCellValue } from '@jsone/core';
import { el, clear, on, addClass, removeClass, toggleClass, hasClass, setText, show, hide } from './dom';

export interface TableState {
  data: TableResult;
  filteredRows: Record<string, any>[];
  searchQuery: string;
  sortKey: string | null;
  sortOrder: 'asc' | 'desc';
}

export function createTableState(data: TableResult): TableState {
  return {
    data,
    filteredRows: data.rows,
    searchQuery: '',
    sortKey: null,
    sortOrder: 'asc',
  };
}

/**
 * Filter rows based on search query
 */
export function filterRows(rows: Record<string, any>[], query: string): Record<string, any>[] {
  if (!query.trim()) {
    return rows;
  }

  const lowerQuery = query.toLowerCase();
  return rows.filter((row) => {
    return Object.values(row).some((value) => {
      return String(value).toLowerCase().includes(lowerQuery);
    });
  });
}

/**
 * Sort rows by a column
 */
export function sortRows(
  rows: Record<string, any>[],
  sortKey: string,
  order: 'asc' | 'desc'
): Record<string, any>[] {
  const sorted = [...rows];
  sorted.sort((a, b) => {
    const aVal = a[sortKey];
    const bVal = b[sortKey];

    // Handle null/undefined
    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return 1;
    if (bVal == null) return -1;

    // Handle numbers
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return order === 'asc' ? aVal - bVal : bVal - aVal;
    }

    // Handle dates
    const aDate = new Date(aVal).getTime();
    const bDate = new Date(bVal).getTime();
    if (!isNaN(aDate) && !isNaN(bDate)) {
      return order === 'asc' ? aDate - bDate : bDate - aDate;
    }

    // String comparison
    const aStr = String(aVal).toLowerCase();
    const bStr = String(bVal).toLowerCase();
    if (order === 'asc') {
      return aStr.localeCompare(bStr);
    } else {
      return bStr.localeCompare(aStr);
    }
  });

  return sorted;
}

/**
 * Render table from state
 */
export function renderTable(
  container: HTMLElement,
  state: TableState,
  onCellClick: (key: string, value: string) => void
): void {
  clear(container);

  if (state.filteredRows.length === 0) {
    const emptyDiv = el('div', { class: 'empty-state' }, [
      el('p', {}, ['No rows to display']),
    ]);
    container.appendChild(emptyDiv);
    return;
  }

  const table = el('table');
  const thead = el('thead');
  const tbody = el('tbody');

  // Table header
  const headerRow = el('tr');
  for (const col of state.data.columns) {
    const th = el('th', { class: 'sortable' }, [col.label]);
    on(th, 'click', () => {
      const isCurrentSort = state.sortKey === col.key;
      state.sortKey = col.key;
      state.sortOrder = isCurrentSort && state.sortOrder === 'asc' ? 'desc' : 'asc';
      updateTableSort(state);
      renderTable(container, state, onCellClick);
    });

    if (state.sortKey === col.key) {
      addClass(th, state.sortOrder === 'asc' ? 'sort-asc' : 'sort-desc');
    }

    headerRow.appendChild(th);
  }
  thead.appendChild(headerRow);

  // Table body
  for (const row of state.filteredRows) {
    const tr = el('tr');
    for (const col of state.data.columns) {
      const value = row[col.key];
      const { display, full } = formatCellValue(value);

      const td = el('td');

      if (display.length > 60 || full !== display) {
        addClass(td, 'truncated');
        setText(td, display);
        on(td, 'click', () => {
          onCellClick(col.label, full);
        });
      } else {
        setText(td, display);
      }

      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }

  table.appendChild(thead);
  table.appendChild(tbody);
  container.appendChild(table);
}

/**
 * Update sort state
 */
function updateTableSort(state: TableState): void {
  if (state.sortKey) {
    state.filteredRows = sortRows(state.filteredRows, state.sortKey, state.sortOrder);
  }
}

/**
 * Update filter and re-render
 */
export function updateSearch(state: TableState, query: string): void {
  state.searchQuery = query;
  state.filteredRows = filterRows(state.data.rows, query);
  if (state.sortKey) {
    state.filteredRows = sortRows(state.filteredRows, state.sortKey, state.sortOrder);
  }
}

/**
 * Render tree view (JSON structure)
 */
export function renderTreeView(container: HTMLElement, data: any, maxDepth = 3): void {
  clear(container);

  if (!data) {
    const emptyDiv = el('div', { class: 'empty-state' }, [
      el('p', {}, ['No data to display']),
    ]);
    container.appendChild(emptyDiv);
    return;
  }

  const pre = document.createElement('pre');
  pre.textContent = JSON.stringify(data, null, 2);
  container.appendChild(pre);
}

/**
 * Export table to CSV
 */
export function exportTableToCSV(state: TableState, filename = 'export.csv'): string {
  const rows: string[] = [];

  // Header
  const headers = state.data.columns.map((col) => escapeCSV(col.label));
  rows.push(headers.join(','));

  // Rows
  for (const row of state.filteredRows) {
    const cells = state.data.columns.map((col) => {
      const value = row[col.key];
      const { full } = formatCellValue(value);
      return escapeCSV(full);
    });
    rows.push(cells.join(','));
  }

  return rows.join('\n');
}

/**
 * Escape CSV values
 */
function escapeCSV(value: string): string {
  // If contains comma, newline, or quote, wrap in quotes and escape quotes
  if (value.includes(',') || value.includes('\n') || value.includes('"')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Show modal with expanded cell content
 */
export function showCellModal(title: string, content: string): void {
  const modal = document.getElementById('expandModal');
  const titleEl = document.getElementById('expandModalTitle');
  const bodyEl = document.getElementById('expandModalBody');

  if (titleEl) setText(titleEl, title);
  if (bodyEl) setText(bodyEl, content);
  if (modal) modal.classList.add('active');
}

/**
 * Show message (success or error)
 */
export function showMessage(message: string, type: 'success' | 'error' = 'success'): void {
  const container = document.getElementById('messages');
  if (!container) return;

  const msgEl = el('div', { class: type }, [message]);
  container.appendChild(msgEl);

  setTimeout(() => {
    msgEl.remove();
  }, 3000);
}
