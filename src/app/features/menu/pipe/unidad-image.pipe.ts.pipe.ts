import { Pipe, PipeTransform } from '@angular/core';
import { ListaPermisos } from '../interfaces/listaPermisos';

@Pipe({
  name: 'unidadIcon',
  standalone: true
})
export class UnidadIconPipe implements PipeTransform {
  private readonly iconMap: Record<string, string> = {
    'Registro Habeas Data':          'pi pi-database',
    'Reporte Habeas Data':           'pi pi-question-circle',
    'Asignación médicos':            'pi pi-user-plus',
    'Gestión de Usuarios':           'pi pi-users pi-fw',
    'Gestión médicos':               'pi pi-user-edit',
    'Historico Reporte Clave Única': 'pi pi-chart-bar'
  };

  transform(unidad: ListaPermisos): string {
    return this.iconMap[unidad.nombre] ?? 'pi pi-question';
  }
}
