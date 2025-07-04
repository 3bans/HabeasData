import { CommonModule } from '@angular/common';
import {  Component, OnInit } from '@angular/core';
import { ApiService } from '../../../../core/api/api.service';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { NavbarComponent } from '../../../../shared/navbar/navbar.component';
import { MenuComponent } from '../menu/menu.component';
import { ListaPermisos } from '../../interfaces/listaPermisos';
import { API_URLS } from '../../../../core/config/apiConfig';
import { ModalComponent } from "../../../../shared/modal/modal.component";
import { ListSelectLoaderComponent } from "../../../../shared/ListLoaderComponent/ListLoaderComponent.component";
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { ApiResponse } from '../../../habeasPaciente/interfaces/PacienteResponse.interface';
import { ButtonModule } from 'primeng/button';
@Component({
  selector: 'app-lista-menu',
  standalone: true,
  templateUrl: './listaMenu.component.html',
  imports: [
    CommonModule,
    NavbarComponent,
    MenuComponent,
    CardModule, DividerModule, InputTextModule, ProgressSpinnerModule,
    ModalComponent,ButtonModule,
    ListSelectLoaderComponent
],

  styleUrl: './listaMenu.component.css',

})
export class ListaMenuComponent implements OnInit {
  apps: ListaPermisos[] = [];  // Aquí almacenaremos los datos recibidos de la API
  loading: boolean = true;  // Para controlar el estado de carga
  urlpuntoServicio:string="";
    showModal: boolean = false;
        selectedPunto: string | null = null;
acceptDisabled: boolean = true;

  constructor(private apiService: ApiService) {

  }
  ngOnInit() {
    this.fetchApps();

    const punto = localStorage.getItem('punto');
    if (!punto) {
      this.urlpuntoServicio = API_URLS.puntoServicio;
      this.showModal = true;
      this.acceptDisabled=true;
    } else {
      this.selectedPunto = punto;
            this.acceptDisabled=false;

    }
  }

  fetchApps() {

    const token = localStorage.getItem('token');
    const url = API_URLS.gateway.validarToken+token;
console.log('url'+url);
    // Llamada a la API pasando el token como parámetro
    this.apiService.get<ListaPermisos[]>(url, { token }).subscribe(
      (response) => {
        this.apps = response;  // Almacenamos los datos de la respuesta
        this.loading = false;  // Desactivamos el estado de carga
      },
      (error) => {
        console.error('Error al obtener los datos', error);
        this.loading = false;  // Desactivamos el estado de carga en caso de error
      }
    );
  }
  onUnidadClick(unidad: ListaPermisos) {
    // lógica al hacer clic
  }





  closeModal(){
    this.showModal=false;
  }

seleccionPunto() {
    if (this.selectedPunto) {
      localStorage.setItem('punto', this.selectedPunto);
      this.showModal = false;
    }
  }



  onSeleccion(label: any): void {
    if (label) {
      localStorage.setItem('punto', label);
      this.selectedPunto = label;
      this.acceptDisabled = false; // habilita botón
    } else {
      this.acceptDisabled = true; // deshabilita si se borra
    }
  }


}
