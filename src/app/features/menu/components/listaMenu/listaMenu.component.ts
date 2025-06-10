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
@Component({
  selector: 'app-lista-menu',
  standalone: true,
  templateUrl: './listaMenu.component.html',
  imports: [
    CommonModule,
    NavbarComponent,
    MenuComponent,
    CardModule,DividerModule,InputTextModule,ProgressSpinnerModule
],

  styleUrl: './listaMenu.component.css',

})
export class ListaMenuComponent implements OnInit {
  apps: ListaPermisos[] = [];  // Aquí almacenaremos los datos recibidos de la API
  loading: boolean = true;  // Para controlar el estado de carga
  constructor(private apiService: ApiService) {}
  ngOnInit() {
    this.fetchApps();  // Llamada al servicio al inicializar el componente
  }

  fetchApps() {
    const token = localStorage.getItem('token');
    const url = API_URLS.gateway.validarToken+token;

    // Llamada a la API pasando el token como parámetro
    this.apiService.get<ListaPermisos[]>(url, { token }).subscribe(
      (response) => {
        this.apps = response;  // Almacenamos los datos de la respuesta
        console.log(this.apps);
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
}
