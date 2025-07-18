export type TableButton = {
  label?: string;  // <-- Cambia esto para que sea opcional
  icon?: string;
  action: string;
  class?: string;
};


export interface FieldColumn {
  field: string;
  header: string;
}

export interface ButtonColumn {
  header: string;
  type: 'buttons';
  buttons: TableButton[];
}

export type ColumnDefinition = FieldColumn | ButtonColumn;
