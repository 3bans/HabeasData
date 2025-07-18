import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ApiService } from '../../../../core/api/api.service';
import { ReactiveFormsModule, Validators,FormBuilder, FormGroup  } from '@angular/forms';
import { Usuario } from '../../interfaces/usuario.interface';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { API_URLS } from '../../../../core/config/apiConfig';
import { GenericTableComponentComponent } from "../../../../shared/GenericTableComponent/GenericTableComponent.component";
import { NavbarComponent } from "../../../../shared/navbar/navbar.component";
import { ModalComponent } from "../../../../shared/modal/modal.component";
import { SelectItem } from 'primeng/api';
import { PrimeNGModule } from '../../../../ui/primeng/primeng.module';
import { InputComponent } from '../../../../shared/input-text/input-text.component';
import { ListSelectLoaderComponent } from "../../../../shared/ListLoaderComponent/ListLoaderComponent.component";
import { TIPO_DOCUMENTO_OPTIONS } from '../../../../shared/constants/tipo-documento.constants';
import { ApiResponse } from '../../../habeasPaciente/interfaces/PacienteResponse.interface';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ToastHelperService } from '../../../../shared/helpers/ToastHelperService';
import { ColumnDefinition } from '../../../../shared/interfaces/column.interface';




@Component({
  selector: 'app-usuarios-component',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule, GenericTableComponentComponent, NavbarComponent, PrimeNGModule, InputComponent,
    ModalComponent, ReactiveFormsModule, ListSelectLoaderComponent, ToastModule],
  templateUrl: './UsuariosComponent.component.html',
  styleUrls: ['./UsuariosComponent.component.css']
})

export class UsuariosComponentComponent {
  showModalRegistro: boolean = false;
  listaUsuarios: Usuario[] = [];
  formRegistroUsuario!: FormGroup;
  urlCargarRol: string = '';
  urlCargarPunto: string = '';


columns: ColumnDefinition[] = [
  { field: 'idUsuario', header: 'Identificación' },
  { field: 'tipoIdUsuario', header: 'Tipo documento' },
  { field: 'nombre', header: 'Nombre completo' },
  { field: 'puntoAtencion', header: 'Punto de servicio' },
  { field: 'nombreRol', header: 'Rol' },
  { field: 'estado', header: 'Estado' },
  { field: 'departamento', header: 'Departamento' },
  { field: 'seccion', header: 'Sección' },
  {
    header: '',
    type: 'buttons',
    buttons: [
      {
        label: ' ', // ← obligatorio pero vacío para evitar errores de tipo
        icon: 'pi pi-pencil',
        action: 'editar',
        class: 'btn-icon-custom'
      }
    ]
  }
];





  rol: string = "";
  puntoServicio: string = "";
  usuarioSeleccionado: any = null;
  tipoDocumentoOptions: SelectItem[] = TIPO_DOCUMENTO_OPTIONS;

  constructor(private apiService: ApiService, private fb: FormBuilder, private messageService: MessageService, private toast: ToastHelperService) { }

  ngOnInit(): void {
    this.urlCargarPunto = API_URLS.cargarPuntoServicio;
    this.urlCargarRol = API_URLS.cargarRoles;
    this.consultarUsuarios();

   this.buildForm();

  }


  private buildForm(): void {
  this.formRegistroUsuario = this.fb.group({
    tipoIdUsuario: [null, Validators.required],
    idUsuario: [null, Validators.required],
    nombre: [null, Validators.required],
    departamento: [null, Validators.required],
    seccion: [null, Validators.required],
    rolId: [null, Validators.required],
    puntoAtencion: [null, Validators.required],
    estado: 'S',
  });
}
  consultarUsuarios(): void {
    const cargarListaUsuarios = API_URLS.cargarListaUsuarios;
    this.apiService
      .getResponse<Usuario[]>(cargarListaUsuarios)
      .subscribe({
        next: (response: HttpResponse<Usuario[]>) => {
          if (response.status === 200 && response.body) {
            this.listaUsuarios = response.body;
          }
        },
        error: (err: HttpErrorResponse) => {
          this.toast.error('Consultar usuarios', ' Error al consultar usuarios');

        }
      });
  }

  onReset() {
    this.formRegistroUsuario.reset();
    this.showModalRegistro = false;

  }
  openModel() {
    this.showModalRegistro = true;
  }
  onSeleccion(event: any, campo: string): void {
    const control = this.formRegistroUsuario.get(campo);
    control?.setValue(event);
    control?.markAsTouched();
    control?.markAsDirty();
    control?.updateValueAndValidity();
  }


  handleAction(event: { action: string, row: any }): void {
  if (event.action === 'editar') {
    this.editarUsuario(event.row);
  }
}

  editarUsuario(usuario: any): void {
    this.usuarioSeleccionado = usuario;
    this.urlCargarPunto = API_URLS.cargarPuntoServicio;
    this.urlCargarRol = API_URLS.cargarRoles;
    const puntoId = String(usuario.idPuntoAtencion);
    const rolId = String(usuario.rolId);
    this.formRegistroUsuario.patchValue({
      tipoIdUsuario: usuario.tipoIdUsuario,
      idUsuario: usuario.idUsuario,
      nombre: usuario.nombre,
      departamento: usuario.departamento,
      seccion: usuario.seccion,
      rolId: rolId,
      puntoAtencion: puntoId,
      estado: usuario.estado,
    });
    this.showModalRegistro = true;
  }

  RegistrarUsuario() {
    const body = {
      idUsuario: this.formRegistroUsuario.get('idUsuario')!.value,
      tipoIdUsuario: this.formRegistroUsuario.get('tipoIdUsuario')!.value,
      nombre: this.formRegistroUsuario.get('nombre')!.value,
      puntoAtencion: this.formRegistroUsuario.get('puntoAtencion')!.value,
      departamento: this.formRegistroUsuario.get('departamento')!.value,
      seccion: this.formRegistroUsuario.get('seccion')!.value,
      estado: "S",
      rolId: this.formRegistroUsuario.get('rolId')!.value
    };

    this.apiService
      .post<ApiResponse<any>>(API_URLS.crearUsuario, body)
      .subscribe({
        next: (response: ApiResponse<any>) => {
          this.showModalRegistro = false;
          this.toast.success('Registro exitoso', 'El usuario fue registrado correctamente');
          this.consultarUsuarios();
        },
        error: (err: HttpErrorResponse) => {
          this.toast.error('Registro usuarios', 'Error al registrar el usuario');


        }
      });

  }

  guardarCambios(): void {
    if (!this.usuarioSeleccionado) return;
    const datosActualizados = {
      ...this.usuarioSeleccionado,
      ...this.formRegistroUsuario.value,
    };
    this.apiService
      .put<ApiResponse<any>>(API_URLS.actualizarUsuario, datosActualizados)
      .subscribe({
        next: res => {
          this.toast.success('Registro exitoso', 'El usuario fue actualizado correctamente');
          this.consultarUsuarios();
          this.closeModal();
        },
        error: err => {
          this.toast.error('Actualizar usuarios', 'Error al actualizar el usuario');
        }
      });

    this.usuarioSeleccionado = null;
    this.showModalRegistro = false;
    this.consultarUsuarios();
    this.formRegistroUsuario.reset();
  }

  closeModal(): void {
    this.showModalRegistro = false;
    this.usuarioSeleccionado = null;
    this.formRegistroUsuario.reset();
  }


}
