import { Routes } from '@angular/router';
import { LoginComponent } from './features/autenticacion/components/login/login.component';
import { PacienteHabeasComponent } from './features/habeasPaciente/components/pacienteHabeas/pacienteHabeas.component';
import { ListaMenuComponent } from './features/menu/components/listaMenu/listaMenu.component';


export const routes: Routes = [
  {path: '', component: LoginComponent},
  {path: 'ListaMenuComponent', component: ListaMenuComponent},
  {path: 'habeasPaciente', component: PacienteHabeasComponent}

];
