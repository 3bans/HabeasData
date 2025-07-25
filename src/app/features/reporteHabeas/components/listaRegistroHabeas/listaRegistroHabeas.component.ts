import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from "../../../../shared/navbar/navbar.component";
import { ToastModule } from "primeng/toast";
import { ColumnDefinition } from '../../../../shared/interfaces/column.interface';
import { ApiService } from '../../../../core/api/api.service';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ToastHelperService } from '../../../../shared/helpers/ToastHelperService';
import { API_URLS } from '../../../../core/config/apiConfig';
import { HabeasData } from '../../interfaces/HabeasData.interfac';
import { HttpParams } from '@angular/common/http';
import { GenericTableComponentComponent } from "../../../../shared/GenericTableComponent/GenericTableComponent.component";
import { SelectModule } from "primeng/select";
import { InputComponent } from '../../../../shared/input-text/input-text.component';
import { ListSelectLoaderComponent } from "../../../../shared/ListLoaderComponent/ListLoaderComponent.component";

@Component({
  selector: 'app-lista-registro-habeas',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ToastModule,
    SelectModule,
    NavbarComponent,
    InputComponent,
    ListSelectLoaderComponent,
    GenericTableComponentComponent
  ],
  templateUrl: './listaRegistroHabeas.component.html',
  styleUrls: ['./listaRegistroHabeas.component.css'],
})
export class ListaRegistroHabeasComponent implements OnInit {
  filtroForm!: FormGroup;
  listaUsuarios: HabeasData[] = [];

  // URLs para cargar los dropdowns
  urlMotivosHabeas = API_URLS.motivosHabeas;
  urlCargarLista    = API_URLS.cargarListaEspecialistas;

  // Para capturar selects si quieres separarlos
  selectedMedicoId!: string;
  selectedMotivoId!: string;

  // Opciones fijas de aprobación
  RespuestaHabeas = [
    { label: 'S', value: 'S' },
    { label: 'P', value: 'P' },
    { label: 'N', value: 'N' }
  ];

  // Definición de columnas para la tabla genérica
  columns: ColumnDefinition[] = [
    { field: 'noIdentificacion',     header: 'Identificación Paciente' },
    { field: 'tipoId',               header: 'Tipo Documento'        },
    { field: 'fechaAprobacion',      header: 'Fecha Aprobación'      },
    { field: 'aprobacion',           header: 'Estado Aprobación'     },
    { field: 'idColaborador',        header: 'ID Colaborador'        },
    { field: 'nombreColaborador',    header: 'Nombre Colaborador'    },
    { field: 'puntoAtencion',        header: 'Punto de Atención'     },
    { field: 'medioAutorizacion',    header: 'Medio Autorización'     },
    { field: 'historia',             header: 'Historia Clínica'      },
    { field: 'correoEnviado',        header: 'Correo Enviado'        },
    { field: 'nombreCompletoMedico', header: 'Nombre Médico'         },
    { field: 'motivoDescripcion',    header: 'Motivo'                }
  ];

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private toast: ToastHelperService
  ) {}

  ngOnInit(): void {
    // Inicializa el formulario con todos los controles
    this.filtroForm = this.fb.group({
      identificacion: [''],
      idMotivo:       [''],
      fechaInicio:    [''],
      fechaFin:       [''],
      aprobacion:     ['']
    });

    // Carga inicial sin filtros
    this.buscar();
  }

  /**
   * Arma los parámetros de consulta y actualiza la tabla.
   * Se llama desde el botón Buscar.
   */
  buscar(): void {
    const vals = this.filtroForm.value as Record<string, string>;
    let params = new HttpParams();

    // Añade dinámicamente cada filtro no vacío
    Object.entries(vals).forEach(([key, val]) => {
      if (val) {
        params = params.set(key, val);
      }
    });

    // Si usas selectedX para dropdowns externos:
    if (this.selectedMotivoId) params = params.set('idMotivo', this.selectedMotivoId);
    if (this.selectedMedicoId) params = params.set('identificacion', this.selectedMedicoId);

    const url = API_URLS.cargarListaRegistroFiltros;
    console.log(`GET ${url}?${params.toString()}`);

    this.api.get<HabeasData[]>(url, { params }).subscribe({
      next: data => this.listaUsuarios = data, // ← refresca la tabla
      error: () => this.toast.error('Buscar registros', 'Error al aplicar filtros')
    });
    console.log(this.listaUsuarios);
  }

  /**
   * Resetea filtros y recarga la lista completa.
   */
  limpiar(): void {
    this.filtroForm.reset({
      identificacion: '',
      idMotivo:       '',
      fechaInicio:    '',
      fechaFin:       '',
      aprobacion:     ''
    });
    this.selectedMedicoId = '';
    this.selectedMotivoId = '';
    this.buscar();
  }

  /**
   * Captura los cambios de tus loaders si los manejas por separado.
   */
  onSeleccion(value: any, type: 'medico' | 'motivo'): void {
    if (type === 'medico') {
      this.selectedMedicoId = value;
      this.filtroForm.get('medico')?.setValue(value);
    } else {
      this.selectedMotivoId = value;
      this.filtroForm.get('idMotivo')?.setValue(value);
    }
  }
}
