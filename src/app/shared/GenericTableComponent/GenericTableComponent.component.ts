import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnChanges
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { ColumnDefinition, FieldColumn, ButtonColumn } from '../interfaces/column.interface';

@Component({
  selector: 'app-generic-table-component',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    DialogModule,
    PaginatorModule,
    InputTextModule,
    TableModule
  ],
  templateUrl: './GenericTableComponent.component.html',
  styleUrls: ['./GenericTableComponent.component.css']
})
export class GenericTableComponentComponent implements OnChanges {
  @Input() columns: ColumnDefinition[] = [];
  @Input() data: any[] = [];
  @Input() showActions = false;
  @Input() actionLabel: string = 'Editar';

  @Output() onAction = new EventEmitter<any>();

  filters: { [key: string]: string | undefined } = {};
  paginatedData: any[] = [];
  originalData: any[] = [];
  rows: number = 10;
  first: number = 0;

  ngOnChanges(): void {
    this.columns.forEach(col => {
      if (this.isFieldColumn(col) && !this.filters[col.field]) {
        this.filters[col.field] = '';
      }
    });

    this.originalData = [...this.data];
    this.applyFilters();
  }

  onPageChange(event: any): void {
    this.rows = event.rows;
    this.first = event.first;
    this.updatePaginatedData();
  }

  private updatePaginatedData(): void {
    const start = this.first;
    const end = start + this.rows;
    this.paginatedData = this.data.slice(start, end);
  }

  applyFilters(): void {
    let filtered = [...this.originalData];
    for (const key in this.filters) {
      const term = this.filters[key]?.trim().toLowerCase();
      if (term) {
        filtered = filtered.filter(item =>
          item[key]?.toString().toLowerCase().includes(term)
        );
      }
    }
    this.data = filtered;
    this.first = 0;
    this.updatePaginatedData();
  }

  emitAction(action: string, row: any): void {
    this.onAction.emit({ action, row });
  }

  isFieldColumn(col: ColumnDefinition): col is FieldColumn {
    return 'field' in col;
  }

isButtonColumn(col: ColumnDefinition): col is ButtonColumn {
  return (col as ButtonColumn).type === 'buttons';
}

}
