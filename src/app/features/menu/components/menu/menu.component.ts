import { CommonModule } from '@angular/common';
import {  Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { Router } from '@angular/router';
import { UnidadIconPipe } from '../../pipe/unidad-image.pipe.ts.pipe';
import { ListaPermisos } from '../../interfaces/listaPermisos';

@Component({
  selector: 'app-menu',
  standalone: true,
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css'],
  imports: [
    CommonModule,

    CardModule, // Importa el módulo Card de PrimeNG
    DividerModule //
    ,
    UnidadIconPipe
],

})
export class MenuComponent  {

   @Input() unidad!: ListaPermisos;
  @Output() clickUn = new EventEmitter<ListaPermisos>();

  onClick() {
    this.clickUn.emit(this.unidad);
  }
}
