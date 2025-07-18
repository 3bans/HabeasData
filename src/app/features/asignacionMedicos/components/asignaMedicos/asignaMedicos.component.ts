import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NavbarComponent } from "../../../../shared/navbar/navbar.component";
import { Toast } from "primeng/toast";
import { ApiService } from '../../../../core/api/api.service';
import { ToastHelperService } from '../../../../shared/helpers/ToastHelperService';
import { UsuarioMedico } from '../../interfaces/UsuarioMedico.interface';
import { API_URLS } from '../../../../core/config/apiConfig';
import { GenericTableComponentComponent } from "../../../../shared/GenericTableComponent/GenericTableComponent.component";
import { ModalComponent } from "../../../../shared/modal/modal.component";
import { PrimeNGModule } from "../../../../ui/primeng/primeng.module";
import { Medico } from '../../../adminMedicos/interfaces/Medico.interface';
import { ColumnDefinition } from '../../../../shared/interfaces/column.interface';

@Component({
  selector: 'app-asigna-medicos',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    Toast,
    GenericTableComponentComponent,
    ModalComponent,
    PrimeNGModule
  ],
  templateUrl: './asignaMedicos.component.html',
  styleUrl: './asignaMedicos.component.css',
})
export class AsignaMedicosComponent {
  listaMedicos: Medico[] = [];
  listaSecretarias: UsuarioMedico[] = [];
  medicosSeleccionados: Medico[] = [];
  secretariaSeleccionada: UsuarioMedico | null = null;
  showModal: boolean = false;
showModalVerMedicos: boolean = false;
medicosAsignados: Medico[] = [];
columns: ColumnDefinition[] = [
  { field: 'nombre', header: 'Nombre' },
  { field: 'idUsuario', header: 'Identificación' },
  {
    header: 'Acciones',
    type: 'buttons',
buttons: [
  {
    label: 'Asignar',
    icon: 'pi pi-user-plus',
    action: 'asignar',
    class: 'p-button-sm p-button-primary'
  },
  {
    label: 'Ver médicos',
    icon: 'pi pi-eye',
    action: 'ver',
    class: 'p-button-sm p-button-info ml-2'  // ← separación aquí
  }
]


  }
];



  constructor(
    private apiService: ApiService,
    private toast: ToastHelperService
  ) { }

  ngOnInit(): void {
    this.cargarSecretarias();
    this.cargarMedicos();
  }

  cargarSecretarias(): void {
    this.apiService.getResponse<UsuarioMedico[]>(API_URLS.cargarListaSecretarias).subscribe({
      next: res => this.listaSecretarias = res.body || [],
      error: () => this.toast.error('Carga Secretarias', 'No fue posible obtener las secretarias'),
    });
  }

  cargarMedicos(): void {
    this.apiService.getResponse<Medico[]>(API_URLS.cargarListaEspecialistas).subscribe({
      next: res => this.listaMedicos = res.body || [],
      error: () => this.toast.error('Consulta Médicos', 'No fue posible cargar los médicos'),
    });
  }






  cerrarModal(): void {
    this.showModal = false;
    this.secretariaSeleccionada = null;
    this.medicosSeleccionados = [];
  }

  GuardarasignarMedico(): void {
    if (!this.secretariaSeleccionada) return;

    const payload = {
      idUsuario: this.secretariaSeleccionada.idUsuario,
      idMedicos: this.medicosSeleccionados.map(m => m.idMedico)
    };
    console.log(payload);
    this.apiService.post(API_URLS.asignacionMedicos, payload).subscribe({
      next: () => {
        this.toast.success('Asignación', 'Los médicos fueron asignados correctamente');
        this.cerrarModal();
      },
      error: () => {
        this.toast.error('Error', 'No se pudo asignar los médicos');
      }
    });
  }




asignarMedico(event: { action: string; row: UsuarioMedico }): void {
  if (event.action === 'asignar') {
    this.secretariaSeleccionada = event.row;
    this.medicosSeleccionados = [];
    this.showModal = true;
  } else if (event.action === 'ver') {
    this.verMedicosAsignados(event.row);
  }
}

verMedicosAsignados(secretaria: UsuarioMedico): void {
  this.apiService.getResponse<Medico[]>(`${API_URLS.listaMedicosAsignados}/${secretaria.idUsuario}`).subscribe({
    next: res => {
      this.medicosAsignados = res.body || [];
      this.secretariaSeleccionada = secretaria;
      this.showModalVerMedicos = true;
    },
    error: () => {
      this.toast.error('Médicos asignados', 'No fue posible cargar los médicos asignados');
    }
  });
}

obtenerMedicosAsignados(idUsuario: string): void {
  this.apiService.getResponse<Medico[]>(`${API_URLS.listaMedicosAsignados}${idUsuario}`).subscribe({
    next: res => {
      this.medicosAsignados = res.body || [];
      this.showModalVerMedicos = true;
    },
    error: () => {
      this.toast.error('Consulta Médicos', 'No se pudo obtener los médicos asignados');
    }
  });
}

cerrarModalVerMedicos(): void {
  this.showModalVerMedicos = false;
  this.medicosAsignados = [];
}

eliminarAsignacionMedico(idMedico: number): void {
  if (!this.secretariaSeleccionada) return;

  const idUsuario = this.secretariaSeleccionada.idUsuario;
  const url = `${API_URLS.eliminarAsignacionMedico}/${idUsuario}/${idMedico}`;

  this.apiService.deleteWithTwoParams(API_URLS.eliminarAsignacionMedico, idUsuario, idMedico)
.subscribe({
    next: () => {
      this.toast.success('Eliminación', 'Médico eliminado correctamente');
      this.verMedicosAsignados(this.secretariaSeleccionada!);
    },
    error: () => {
      this.toast.error('Error', 'No se pudo eliminar el médico');
    }
  });
}


}


