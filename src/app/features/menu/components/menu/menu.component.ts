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
export class MenuComponent implements OnInit {

  @Input()
  public unidad!:ListaPermisos;
  @Output() clickUn = new EventEmitter<ListaPermisos>();

  ngOnInit(): void {
//console.log("valor"+this.unidad);
    //console.log(this.unidad.nombre);
   if (!this.unidad) throw new Error('La unidad es requeridad');
  }
constructor(private router: Router){

}



  onUnidadClick(unidad: any) {


  const selectedUnidad = localStorage.getItem('token');

  // Verificar si existe y parsearlo a JSON
  if (selectedUnidad) {
    const unidadObj = JSON.parse(selectedUnidad);
    this.router.navigate([`${unidad.url}`]);

  }
  }
}
