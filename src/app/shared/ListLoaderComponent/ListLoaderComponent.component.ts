import { Component, Input, Output, EventEmitter, OnInit, forwardRef, SimpleChanges, ViewChild } from '@angular/core';
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
@Input() emitLabel: boolean = false;
selectedValue: any;
   public data:any;
clearSelection() {
  this.selectedValue = null;
  this.data=null;
  this.selectedChange.emit(null); // Para notificar al padre
}
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


      if (this.dataPath) {
        this.data = res[this.dataPath];
      } else if (res?.results && Array.isArray(res.results)) {
         this.data = res.results;
      } else {
         this.data = res;
      }

      this.items = Array.isArray( this.data) ?  this.data : [];

      if (!Array.isArray( this.data)) {
        console.warn('⚠️ La respuesta del backend no es un arreglo. Se recibió:',  this.data);
      }
    },
    error: err => {
      console.error('❌ Error cargando lista desde el backend:', err);
    }
  });
}

  onChange(event: any) {

 this.selected = event.value;
  this.onChangeFn(this.selected);

  const selectedItem = this.items.find(item => item[this.optionValue] === event.value);

  if (this.emitLabel) {
    this.selectedChange.emit(selectedItem.sernom);
 // console.log(selectedItem.sernom);
  } else {
    this.selectedChange.emit(this.selected); // 👈 Solo el value
  }
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
