/**
 * Type definitions for jsone
 */

export type ColumnType = 'auto' | 'string' | 'number' | 'boolean' | 'date' | 'json';

export interface ColumnDef {
  key: string;
  label: string;
  type: ColumnType;
}

export interface Meta {
  title?: string;
  views?: ViewDef[];
  [key: string]: any;
}

export interface ViewDef {
  id: string;
  type?: string;
  source?: string;
  columns?: ColumnHint[];
  [key: string]: any;
}

export interface ColumnHint {
  key: string;
  label?: string;
  type?: ColumnType;
}

export interface TableResult {
  rows: Record<string, any>[];
  columns: ColumnDef[];
}

export interface JsoneResult {
  meta?: Meta;
  data: any;
}
