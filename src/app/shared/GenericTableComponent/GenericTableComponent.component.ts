import { CommonModule } from '@angular/common';
import {  Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { PaginatorModule } from 'primeng/paginator';



@Component({
  selector: 'app-generic-table-component',
  standalone: true,
  imports: [CommonModule, ButtonModule, DialogModule, PaginatorModule],
  templateUrl: './GenericTableComponent.component.html',
  styleUrls: ['./GenericTableComponent.component.css']
})
export class GenericTableComponentComponent {
  @Input() columns: { field: string; header: string }[] = [];
@Input() data: any[] = [];
  @Input() showActions = false;
  @Input() actionLabel: string = 'Editar';

  @Output() onAction = new EventEmitter<any>();

  // Paginación
  paginatedData: any[] = [];
  rows: number = 10;
  first: number = 0;

  ngOnChanges(): void {
    this.updatePaginatedData();
  }

  onPageChange(event: any): void {
    this.rows = event.rows;
    this.first = event.first;
    this.updatePaginatedData();
  }

  private updatePaginatedData(): void {
    if (this.data) {
      this.paginatedData = this.data.slice(this.first, this.first + this.rows);
    }
  }
}
