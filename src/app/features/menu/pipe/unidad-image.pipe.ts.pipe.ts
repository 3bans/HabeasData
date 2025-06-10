// src/app/pipes/unidad-icon.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
import { ListaPermisos } from '../interfaces/listaPermisos';

@Pipe({
  name: 'unidadIcon',
  standalone: true
})
export class UnidadIconPipe implements PipeTransform {
  private readonly iconMap: Record<string, string> = {
    'Registro Habeas Data':        'pi pi-database',
    'Gestión de Usuarios':     'pi pi-users pi-fw',
    'Reporte Habeas Data':         'pi pi-question-circle',
    'Historico Reporte Clave Única':'pi pi-chart-bar',
    'Registro médicos':            'pi pi-user-edit',
    'Asignación médicos':          'pi pi-user-plus'
  };

  transform(unidad: ListaPermisos): string {
    console.log('[unidadIcon] nombre:', unidad.nombre);

    const key = unidad.nombre;
    return this.iconMap[key] || 'pi pi-question';  // fallback
  }
}
