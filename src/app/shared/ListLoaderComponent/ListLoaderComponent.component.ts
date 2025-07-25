import { Component, Input, Output, EventEmitter, OnInit, forwardRef, SimpleChanges, HostBinding } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, FormControl } from '@angular/forms';
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
  /** Altura del componente en píxeles */
  @Input() heightPx: number = 40;
  @HostBinding('style.height.px')
  hostHeight: number;

  @Input() url!: string;
  @Input() optionLabel: string = 'label';
  @Input() optionValue: string = 'value';
  @Input() placeholder: string = 'Seleccione';
  @Input() dataPath: string = '';
  @Input() formControl?: FormControl;
  @Input() emitLabel: boolean = false;

  @Output() selectedChange = new EventEmitter<any>();

  public items: any[] = [];
  public selectedValue: any;

  onChangeFn: any = () => {};
  onTouchedFn: any = () => {};

  constructor(private http: HttpClient) {
    this.hostHeight = this.heightPx;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['heightPx']) {
      this.hostHeight = this.heightPx;
    }
    if (changes['url'] && this.url?.trim()) {
      this.loadData();
    }
  }

  ngOnInit(): void {
    if (this.url?.trim()) {
      this.loadData();
    }
  }

  private loadData(): void {
    this.http.get<any>(this.url).subscribe({
      next: res => {
        let data = res;
        if (this.dataPath) {
          data = res[this.dataPath];
        } else if (res?.results && Array.isArray(res.results)) {
          data = res.results;
        }
        this.items = Array.isArray(data) ? data : [];
      },
      error: err => console.error('Error cargando lista:', err)
    });
  }

  onChange(event: any): void {
    const value = event.value;
    this.selectedValue = value;
    this.onChangeFn(value);

    const selectedItem = this.items.find(item => item[this.optionValue] === value);
    this.selectedChange.emit(this.emitLabel ? selectedItem?.[this.optionLabel] : value);
  }

  writeValue(value: any): void {
    this.selectedValue = value;
  }

  /**
   * Limpia la selección actual y notifica cambio
   */
  clearSelection(): void {
    this.selectedValue = null;
    this.onChangeFn(null);
    this.selectedChange.emit(null);
  }

  registerOnChange(fn: any): void {
    this.onChangeFn = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouchedFn = fn;
  }
}
