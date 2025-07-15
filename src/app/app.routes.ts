import { Routes } from '@angular/router';
import { LoginComponent } from './features/autenticacion/components/login/login.component';
import { PacienteHabeasComponent } from './features/habeasPaciente/components/pacienteHabeas/pacienteHabeas.component';
import { ListaMenuComponent } from './features/menu/components/listaMenu/listaMenu.component';
import { AuthGuard } from './core/auth/auth.guard';
import { UsuariosComponentComponent } from './features/adminusuarios/components/UsuariosComponent/UsuariosComponent.component';
import { MedicosComponent } from './features/adminMedicos/components/Medicos/Medicos.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'menu',
    component: ListaMenuComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'habeasPaciente',
    component: PacienteHabeasComponent,
    canActivate: [AuthGuard]
  },

{
    path: 'adminUsuario',
    component: UsuariosComponentComponent,
    canActivate: [AuthGuard]
  },
{
    path: 'admMed',
    component:MedicosComponent ,
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
