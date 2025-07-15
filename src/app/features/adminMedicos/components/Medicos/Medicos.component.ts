import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { NavbarComponent } from "../../../../shared/navbar/navbar.component";
import { Toast } from "primeng/toast";
import { ModalComponent } from "../../../../shared/modal/modal.component";
import { PrimeNGModule } from "../../../../ui/primeng/primeng.module";
import { GenericTableComponentComponent } from "../../../../shared/GenericTableComponent/GenericTableComponent.component";
import { API_URLS } from '../../../../core/config/apiConfig';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../../../core/api/api.service';
import { ToastHelperService } from '../../../../shared/helpers/ToastHelperService';
import { Medico } from '../../interfaces/Medico.interface';

@Component({
  selector: 'app-medicos',
  standalone: true,
  imports: [CommonModule, DialogModule, ReactiveFormsModule, ModalComponent, PrimeNGModule, GenericTableComponentComponent],
  templateUrl: './Medicos.component.html',
  styleUrls: ['./Medicos.component.css']
})
export class MedicosComponent {
  showModal: boolean = false;
  formMedico!: FormGroup;
  listaMedicos: Medico[] = [];
  medicoSeleccionado: Medico | null = null;

  columns = [
    { field: 'identificacion', header: 'Identificación' },
    { field: 'nombreCompleto', header: 'Nombre' },
    { field: 'estado', header: 'Estado' },
    { field: 'especialidad', header: 'Especialidad' },
    { field: 'consultorio', header: 'Consultorio' },
  ];

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private toast: ToastHelperService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.cargarMedicos();
  }

  private initForm(): void {
    this.formMedico = this.fb.group({
      idMedico: [null],
      identificacion: [null, Validators.required],
      nombreCompleto: [null, Validators.required],
      estado: ['ACTIVO', Validators.required],
      especialidad: [null, Validators.required],
      consultorio: [null, Validators.required],
    });
  }

  cargarMedicos(): void {
    this.apiService.getResponse<Medico[]>(API_URLS.cargarListaEspecialistas).subscribe({
      next: res => this.listaMedicos = res.body || [],
      error: () => this.toast.error('Consulta Médicos', 'No fue posible cargar los médicos'),
    });
  }

  editarMedico(medico: Medico): void {
    this.medicoSeleccionado = medico;
    this.formMedico.patchValue(medico);
    this.showModal = true;
  }

  abrirModal(): void {
    this.medicoSeleccionado = null;
    this.formMedico.reset({ estado: 'ACTIVO' });
    this.showModal = true;
  }

  guardarMedico(): void {
    const medico = this.formMedico.value;

    const handler = this.medicoSeleccionado
      ? this.apiService.put(API_URLS.actualizarMedico, medico)
      : this.apiService.post(API_URLS.registrarMedico, medico);

    handler.subscribe({
      next: () => {
        const msg = this.medicoSeleccionado ? 'actualizado' : 'registrado';
        this.toast.success(`Médico ${msg}`, `El médico fue ${msg} correctamente`);
        this.showModal = false;
        this.cargarMedicos();
      },
      error: () => {
        const msg = this.medicoSeleccionado ? 'actualizar' : 'registrar';
        this.toast.error(`Error al ${msg} médico`, `No fue posible ${msg} el médico`);
      },
    });
  }

  cerrarModal(): void {
    this.showModal = false;
    this.medicoSeleccionado = null;
    this.formMedico.reset();
  }


 }
