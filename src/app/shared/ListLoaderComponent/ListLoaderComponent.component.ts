import { Component, Input, Output, EventEmitter, OnInit, forwardRef, SimpleChanges } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, FormControl } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-list-select-loader',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectModule],
  templateUrl: './ListLoaderComponent.component.html',
  styleUrls: ['./ListLoaderComponent.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ListSelectLoaderComponent),
      multi: true
    }
  ]
})
export class ListSelectLoaderComponent implements OnInit, ControlValueAccessor {
  @Input() url!: string;
  @Input() optionLabel: string = 'label';
  @Input() optionValue: string = 'value';
  @Input() placeholder: string = 'Seleccione';
  @Input() dataPath: string = '';
  @Input() formControl?: FormControl; // ← opcional
  @Output() selectedChange = new EventEmitter<any>();

  items: any[] = [];
  selected: any;

  onChangeFn: any = () => {};
  onTouchedFn: any = () => {};

  constructor(private http: HttpClient) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['url'] && this.url && this.url.trim() !== '') {
      this.loadData();
    }
  }

  ngOnInit(): void {
    // La carga inicial se delega a ngOnChanges
  }

  private loadData(): void {
    this.http.get<any>(this.url).subscribe({
      next: res => {
        this.items = this.dataPath ? res[this.dataPath] : res;
      },
      error: err => {
        console.error('❌ Error cargando lista desde el backend:', err);
      }
    });
  }

  onChange(event: any) {
    this.selected = event.value;
    this.onChangeFn(this.selected);
    this.selectedChange.emit(this.selected);
  }

  writeValue(value: any): void {
    this.selected = value;
  }

  registerOnChange(fn: any): void {
    this.onChangeFn = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouchedFn = fn;
  }
}
