import { CommonModule } from '@angular/common';
import {  Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ApiService } from '../../../../core/api/api.service';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { Usuario } from '../../interfaces/usuario.interface';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { API_URLS } from '../../../../core/config/apiConfig';
import { GenericTableComponentComponent } from "../../../../shared/GenericTableComponent/GenericTableComponent.component";
import { NavbarComponent } from "../../../../shared/navbar/navbar.component";
import { ModalComponent } from "../../../../shared/modal/modal.component";
import { FormBuilder, FormGroup } from '@angular/forms';
import { SelectItem } from 'primeng/api';
import { PrimeNGModule } from '../../../../ui/primeng/primeng.module';
import { InputComponent } from '../../../../shared/input-text/input-text.component';
import { ListSelectLoaderComponent } from "../../../../shared/ListLoaderComponent/ListLoaderComponent.component";
import { TIPO_DOCUMENTO_OPTIONS } from '../../../../shared/constants/tipo-documento.constants';
import { ApiResponse } from '../../../habeasPaciente/interfaces/PacienteResponse.interface';



@Component({
  selector: 'app-usuarios-component',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule, GenericTableComponentComponent, NavbarComponent, PrimeNGModule, InputComponent,
    ModalComponent, ReactiveFormsModule, ListSelectLoaderComponent],
  templateUrl: './UsuariosComponent.component.html',
  styleUrls: ['./UsuariosComponent.component.css']
})
export class UsuariosComponentComponent {
  showModalRegistro: boolean = false;
  listaUsuarios: Usuario[] = [];
  formRegistroUsuario!: FormGroup;
  urlCargarRol:string='';
  urlCargarPunto:string='';
columns = [
  { field: 'idUsuario', header: 'Identificación' },
  { field: 'tipoIdUsuario', header: 'Tipo documento' },
  { field: 'nombre', header: 'Nombre completo' },
  { field: 'puntoAtencion', header: 'Punto Atención' },
  { field: 'rolId', header: 'Rol' },
  { field: 'estado', header: 'Estado' },
  { field: 'departamento', header: 'Departamento' },
  { field: 'seccion', header: 'Sección' }
];
rol:string="";
puntoServicio:string="";
usuarioSeleccionado: any = null;
tipoDocumentoOptions: SelectItem[] = TIPO_DOCUMENTO_OPTIONS;

  constructor(    private apiService: ApiService,     private fb: FormBuilder,) {}

  ngOnInit(): void {
    this.urlCargarPunto=API_URLS.cargarPuntoServicio;
    this.urlCargarRol=API_URLS.cargarRoles;
     this.consultarUsuarios();

  this.formRegistroUsuario = this.fb.group({
  tipoIdUsuario: [null, Validators.required],
  idUsuario: [null, Validators.required],
  nombre: [null, Validators.required],
  departamento: [null, Validators.required],
  seccion: [null, Validators.required],
  rolId: [null, Validators.required],
  puntoAtencion: [null, Validators.required],
   estado: "S",
});

  }


consultarUsuarios(): void {
  const cargarListaUsuarios = API_URLS.cargarListaUsuarios;

  this.apiService
    .getResponse<Usuario[]>(cargarListaUsuarios)  // ✅ Ya no usas ApiResponse<>
    .subscribe({
      next: (response: HttpResponse<Usuario[]>) => {
        if (response.status === 200 && response.body) {
         // console.log('✅ Usuarios recibidos directamente:', response.body);

          this.listaUsuarios = response.body; // ✅ Se asigna directamente
        }
      },
      error: (err: HttpErrorResponse) => {
        console.error('❌ Error al consultar usuarios:', err);
      }
    });
}

onReset(){

}

openModel(){
    this.showModalRegistro=true;

}

onSeleccion(event: any, campo: string): void {
  console.log('🟡 Valor recibido de app-list-select-loader:', event);
  console.log('🟡 Valor recibido de app-list-select-loader:', campo);

  const control = this.formRegistroUsuario.get(campo);
  control?.setValue(event);
  console.log('🔵 Nuevo valor en el formControl:', control?.value);

  control?.markAsTouched();
  control?.markAsDirty();
  control?.updateValueAndValidity();
}

editarUsuario(usuario: any): void {
  this.usuarioSeleccionado = usuario;

  // Llenar el formulario con los datos del usuario seleccionado
  this.formRegistroUsuario.patchValue({
    tipoIdUsuario: usuario.tipoIdUsuario,
    idUsuario: usuario.idUsuario,
    nombre: usuario.nombre,
    departamento: usuario.departamento,
    seccion: usuario.seccion,
    rolId: usuario.rolId,
    puntoAtencion: usuario.puntoAtencion,
  });

  // Mostrar el modal de edición
  this.showModalRegistro = true;
}

RegistrarUsuario(){

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

    console.log(body);
 this.apiService
      .post<ApiResponse<any>>(API_URLS.crearUsuario, body)
      .subscribe({
        next: (response: ApiResponse<any>) => {
          console.log('✅ Registro exitoso:', response);
          this.showModalRegistro = false;
        },
        error: (err: HttpErrorResponse) => {
          console.error('❌ Error al registrar el usuario:', err);
        }
      });



}



guardarCambios(): void {
  if (!this.usuarioSeleccionado) return;

  const datosActualizados = {
    ...this.usuarioSeleccionado,
    ...this.formRegistroUsuario.value,
  };

  // Aquí puedes llamar al servicio para actualizar en el backend
  console.log('Actualizando usuario:', datosActualizados);

  // Luego de guardar:
  this.usuarioSeleccionado = null;
  this.showModalRegistro = false;
  this.formRegistroUsuario.reset();
}



closeModal(): void {
  this.showModalRegistro = false;
  this.usuarioSeleccionado = null;
  this.formRegistroUsuario.reset();
}


}
