// src/app/pages/lista-menu/listaMenu.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';              // <-- Importa Router
import { ApiService } from '../../../../core/api/api.service';
import { API_URLS } from '../../../../core/config/apiConfig';
import { ListaPermisos } from '../../interfaces/listaPermisos';

import { NavbarComponent } from '../../../../shared/navbar/navbar.component';
import { ModalComponent } from '../../../../shared/modal/modal.component';
import { ListSelectLoaderComponent } from '../../../../shared/ListLoaderComponent/ListLoaderComponent.component';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MenuComponent } from '../menu/menu.component';

@Component({
  selector: 'app-lista-menu',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    ModalComponent,
    ListSelectLoaderComponent,
    MenuComponent,
    ButtonModule,
    CardModule,
    DividerModule,
    InputTextModule,
    ProgressSpinnerModule
  ],
  templateUrl: './listaMenu.component.html',
  styleUrls: ['./listaMenu.component.css']
})
export class ListaMenuComponent implements OnInit {
  apps: ListaPermisos[] = [];
  loading = true;
  showModal = false;
  acceptDisabled = true;
  urlpuntoServicio = '';
  selectedPunto: string | null = null;

  // Inyecta Router además de ApiService
  constructor(
    private apiService: ApiService,
    private router: Router     // <-- Aquí
  ) {}

  ngOnInit() {
    const punto = localStorage.getItem('punto');
    if (!punto) {
      this.showModal = true;
      this.urlpuntoServicio = API_URLS.puntoServicio;
    } else {
      this.selectedPunto = punto;
      this.acceptDisabled = false;
    }

    const token = localStorage.getItem('token') ?? '';
    this.apiService
      .get<ListaPermisos[]>(API_URLS.gateway.validarToken + token, { token })
      .subscribe({
        next: apps => {
          this.apps = apps;
          this.loading = false;
        },
        error: () => (this.loading = false)
      });
  }

  get operationsApps() {
    return this.apps.filter(u =>
      ['Registro Habeas Data', 'Reporte Habeas Data'].includes(u.nombre)
    );
  }

  get adminApps() {
    return this.apps.filter(u =>
      ['Asignación médicos','Gestión de Usuarios','Gestión médicos'].includes(u.nombre)
    );
  }

  // Usa this.router.navigate en lugar de apiService.router
  onUnidadClick(unidad: ListaPermisos) {
    this.router.navigate([unidad.url]);
  }

  onSeleccion(label: any) {
    if (label) {
      localStorage.setItem('punto', label);
      this.selectedPunto = label;
      this.acceptDisabled = false;
    } else {
      this.acceptDisabled = true;
    }
  }

  seleccionPunto() {
    if (this.selectedPunto) {
      localStorage.setItem('punto', this.selectedPunto);
      this.showModal = false;
    }
  }
}
