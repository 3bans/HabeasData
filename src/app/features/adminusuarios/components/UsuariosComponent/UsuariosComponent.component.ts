import { CommonModule } from '@angular/common';
import {  Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ApiService } from '../../../../core/api/api.service';
import { ReactiveFormsModule } from '@angular/forms';
import { Usuario } from '../../interfaces/usuario.interface';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { API_URLS } from '../../../../core/config/apiConfig';
import { GenericTableComponentComponent } from "../../../../shared/GenericTableComponent/GenericTableComponent.component";
import { NavbarComponent } from "../../../../shared/navbar/navbar.component";
import { ModalComponent } from "../../../../shared/modal/modal.component";
import { FormBuilder, FormGroup } from '@angular/forms';
import { PUNTOS_SERVICIO_OPTIONS, ROLES_USUARIO_OPTIONS, TIPO_DOCUMENTO_OPTIONS } from '../../../../shared/constants/tipo-documento.constants';
import { SelectItem } from 'primeng/api';
import { PrimeNGModule } from '../../../../ui/primeng/primeng.module';
import { InputComponent } from '../../../../shared/input-text/input-text.component';
import { ListSelectLoaderComponent } from "../../../../shared/ListLoaderComponent/ListLoaderComponent.component";



@Component({
  selector: 'app-usuarios-component',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule, GenericTableComponentComponent, NavbarComponent, PrimeNGModule, InputComponent,
    ModalComponent, ReactiveFormsModule],
  templateUrl: './UsuariosComponent.component.html',
  styleUrls: ['./UsuariosComponent.component.css']
})
export class UsuariosComponentComponent {
  showModalRegistro: boolean = false;
  listaUsuarios: Usuario[] = [];
  formRegistroUsuario!: FormGroup;

columns = [
  { field: 'idUsuario', header: 'Identificación' },
  { field: 'tipoIdUsuario', header: 'Tipo documento' },
  { field: 'nombre', header: 'Nombre completo' },
  { field: 'puntoAtencion', header: 'Punto Atención' },
  { field: 'nombreRol', header: 'Rol' },
  { field: 'estado', header: 'Estado' },
  { field: 'departamento', header: 'Departamento' },
  { field: 'seccion', header: 'Sección' }
];
tipoDocumentoOptions: SelectItem[] = TIPO_DOCUMENTO_OPTIONS;
puntoAtencion: SelectItem[] = PUNTOS_SERVICIO_OPTIONS;
rol: SelectItem[] = ROLES_USUARIO_OPTIONS;
  constructor(    private apiService: ApiService,     private fb: FormBuilder,) {}

  ngOnInit(): void {


     this.consultarUsuarios();

      this.formRegistroUsuario = this.fb.group({
      tipoDocumento: [],
      identificacion: [],
      nombrecompleto: [],
      departamento: [],
      seccion: [],
      puntoServicio: [],
      RolUsuario: [],


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


openModel(){
    this.showModalRegistro=true;

}

onSubmit(){}

closeModal(){
  this.showModalRegistro=false;
}

  editarUsuario(usuario: any): void {
    console.log('Editar usuario:', usuario);
    // Aquí podrías abrir un modal o redirigir a un formulario
  }
}
