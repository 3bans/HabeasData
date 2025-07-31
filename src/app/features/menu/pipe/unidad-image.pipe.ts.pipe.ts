import { Pipe, PipeTransform } from '@angular/core';
import { ListaPermisos } from '../interfaces/listaPermisos';

@Pipe({
  name: 'unidadIcon',
  standalone: true
})
export class UnidadIconPipe implements PipeTransform {
private readonly iconMap: Record<string, string> = {
  'Registro Habeas Data':          'pi pi-file',        // icono genérico de documento
  'Reporte Habeas Data':           'pi pi-chart-bar',   // gráfico de barras
  'Asignación médicos':            'pi pi-user-plus',   // añade usuario
  'Gestión de Usuarios':           'pi pi-users',       // grupo de usuarios
  'Gestión médicos':               'pi pi-user-edit',   // editar usuario
  'Historico Reporte Clave Única': 'pi pi-calendar'     // calendario / historial
};


  transform(unidad: ListaPermisos): string {
    return this.iconMap[unidad.nombre] ?? 'pi pi-question';
  }
}
