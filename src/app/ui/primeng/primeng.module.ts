import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Importar los componentes de PrimeNG que necesitas
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MenubarModule } from 'primeng/menubar';
import { PasswordModule } from 'primeng/password';
import { FormsModule } from '@angular/forms'; // Para usar ngModel
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { SelectModule } from 'primeng/select';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MultiSelectModule } from 'primeng/multiselect';

@NgModule({
  imports: [
    CommonModule,
    InputTextModule,
    ButtonModule,
    MenubarModule,
    PasswordModule,
    FormsModule,
    CardModule,
    DropdownModule,
    SelectModule,
    ConfirmDialogModule,
    MultiSelectModule


  ],
  exports: [
    InputTextModule,
    ButtonModule,
    MenubarModule,
    PasswordModule,
    FormsModule,
    CardModule,
    DropdownModule,
    SelectModule,
    ConfirmDialogModule,
    MultiSelectModule
  ]
})
export class PrimeNGModule {}
