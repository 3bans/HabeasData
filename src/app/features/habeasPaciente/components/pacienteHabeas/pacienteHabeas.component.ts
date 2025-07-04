import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { DividerModule } from 'primeng/divider';
import { NavbarComponent } from '../../../../shared/navbar/navbar.component';
import { PrimeNGModule } from '../../../../ui/primeng/primeng.module';
import { InputComponent } from '../../../../shared/input-text/input-text.component';
import { API_URLS } from '../../../../core/config/apiConfig';
import {FormBuilder,FormGroup,ReactiveFormsModule,Validators} from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { ApiResponse, PacienteResponse, ValidarCodigoResponse } from '../../interfaces/PacienteResponse.interface';
import { ApiService } from '../../../../core/api/api.service';
import { ModalComponent } from "../../../../shared/modal/modal.component";
import { ListSelectLoaderComponent } from "../../../../shared/ListLoaderComponent/ListLoaderComponent.component";
import { HabeasData } from '../../interfaces/HabeasData';
import { EstadoHabeas } from '../../interfaces/estadosHabeas.interface';

@Component({
  selector: 'app-paciente-habeas',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NavbarComponent,
    PrimeNGModule,
    DividerModule,
    InputComponent,
    ModalComponent,
    ListSelectLoaderComponent
  ],
  templateUrl: './pacienteHabeas.component.html',
  styleUrls: ['./pacienteHabeas.component.css'],
})
export class PacienteHabeasComponent implements OnInit, OnDestroy {
  formHabeas!: FormGroup;
  showModal: boolean = false;
    showModalHabeas = false;
  showModalRegistro: boolean = false;
  registroHabilitado: boolean = false;
estadosHabeas: EstadoHabeas[] = [];
  codigo!:Number;
  public urlCargarLista = "";
  public urlMotivosHabeas = "";
  private formChangesSub!: Subscription;
  mensajeErrorHabeas: string | null = null;
  mensajeErrorBusquedad: string | null = null;
  mensajeEstadoHabeas: any | null = null;
  selectedMedicoId!: string;
  selectedMotivoId!: string;
  identificacion!: any;
  tipoDocumentoOptions = [
    { label: 'Cédula de Ciudadanía', value: 'CC' },
    { label: 'Tarjeta de Identidad', value: 'TI' },
    { label: 'Registro Civil de Nacimiento', value: 'RC' },
    { label: 'Cédula de Extranjería', value: 'CE' },
    { label: 'Pasaporte', value: 'P' },
    { label: 'Permiso Especial de Permanencia', value: 'PEP' },
    { label: 'Permiso por Protección Temporal', value: 'PPT' },
    { label: 'Salvoconducto de Permanencia', value: 'SC' },
    { label: 'Carné Diplomático', value: 'CD' },
    { label: 'Número de Identificación Tributaria', value: 'NIT' },
    { label: 'Documento de Identificación Extranjero', value: 'DE' },
    { label: 'Sin identificación del Exterior', value: 'SX' }
  ];

  RespuestaHabeas = [
    { label: 'Si', value: 'Si' },
    { label: 'No', value: 'No' },
  ];
  TipoHabeas = [
    { label: 'Fisico', value: 'Fisico' },
    { label: 'Virtual', value: 'Virtual' },
  ];
  constructor(
    private fb: FormBuilder,
    private apiService: ApiService

  ) { }

  ngOnInit(): void {

    this.formHabeas = this.fb.group({
      tipoDocumento: [null, Validators.required],
      identificadorUnico: ['', Validators.required],
      identificacion: [{ value: '', disabled: true }, Validators.required],
      nombresPaciente: [{ value: '', disabled: true }, Validators.required],
      primerApellido: [{ value: '', disabled: true }, Validators.required],
      segundoApellido: [{ value: '', disabled: true }, Validators.required],
      codigo: [{ value: '', disabled: false }],
      celular: [{ value: '', disabled: true }, Validators.required],
      fechaNacimiento: [{ value: '', disabled: true }, Validators.required],
      correoElectronico: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      autorizacionHabeas: [{ value: null, disabled: true }, Validators.required]
    });
    this.mensajeErrorHabeas = null;
    this.mensajeErrorBusquedad = null;
    this.mensajeEstadoHabeas = null;
    this.formChangesSub = this.formHabeas.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged((prev, curr) =>
          prev.tipoDocumento === curr.tipoDocumento &&
          prev.identificadorUnico === curr.identificadorUnico
        ))
      .subscribe(valores => {
        const { tipoDocumento, identificadorUnico } = valores;
        if (
          this.formHabeas.get('tipoDocumento')!.valid &&
          this.formHabeas.get('identificadorUnico')!.valid
        ) {
          this.mensajeErrorHabeas = null;
          this.mensajeErrorBusquedad = null;
          this.consultarInformacionPaciente();
          this.consultarHabeas();
        }
      });
  }

  consultarInformacionPaciente(): void {
    const tipoDocumento = this.formHabeas.get('tipoDocumento')!.value;
    const identificadorUnico = this.formHabeas.get('identificadorUnico')!.value;
    const urlInfoPaciente = API_URLS.administradorHabeas
      .consultaInformacion(identificadorUnico, tipoDocumento);
    // console.log("url buscar"+urlInfoPaciente);
    this.apiService
      .getResponse<ApiResponse<PacienteResponse>>(urlInfoPaciente)
      .subscribe({
        next: (response: HttpResponse<ApiResponse<PacienteResponse>>) => {
          if (response.status === 200 && response.body) {
            const apiResp = response.body;
            if (apiResp.results) {
              const datos: PacienteResponse = apiResp.results;
              this.formHabeas.patchValue({
                identificacion: datos.numPaciente,
                nombresPaciente: datos.nombres,
                primerApellido: datos.apellido1,
                segundoApellido: datos.apellido2,
                celular: datos.celular,
                fechaNacimiento: datos.fechaNacimiento,
                correoElectronico: datos.correo
              });
              this.formHabeas.get('autorizacionHabeas')!.enable();
              this.registroHabilitado = true;

            } else {
              this.mensajeErrorBusquedad = 'No se encuentra infomación del paciente';
              this.registroHabilitado = false;
            }
          }
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 404) {
            this.mensajeErrorBusquedad = 'No se encuentra infomación del paciente';
            this.registroHabilitado = false;
          } else {
            console.error('Error al consultar información del paciente:', err);
            this.registroHabilitado = false;
          }
        }
      });
  }


  ngOnDestroy(): void {
    this.formChangesSub.unsubscribe();
  }
  consultarHabeas(): void {
  const tipoDocumento = this.formHabeas.get('tipoDocumento')!.value;
  const identificadorUnico = this.formHabeas.get('identificadorUnico')!.value;
  const url = API_URLS.administradorHabeas.consultaEstadoHabeas(identificadorUnico, tipoDocumento);

  this.apiService.getResponse<ApiResponse<HabeasData | HabeasData[]>>(url).subscribe({
    next: (response: HttpResponse<ApiResponse<HabeasData | HabeasData[]>>) => {
      const data = response.body?.results;

      if (!data) {
        console.warn('⚠️ Respuesta sin datos de habeas.');
        return;
      }

      this.formHabeas.get('autorizacionHabeas')?.enable();
      this.formHabeas.get('autorizacionHabeas')?.setValue('Si');

      const registros = Array.isArray(data) ? data : [data];


this.estadosHabeas = registros.map((r) => ({
  tipo: r.aprobacion as 'P' | 'S' | 'N',
  medico: r.nombreMedico || 'Médico no especificado',
  fecha: r.fechaRegistro || 'Fecha no registrada',
  motivo: r.descripcion || 'Sin motivo registrado',
}));





    },

    error: (err: HttpErrorResponse) => {
      if (err.status === 404) {
        this.mensajeErrorHabeas = 'El usuario no registra Habeas Data.';
        this.mensajeEstadoHabeas = null;
      } else {
        console.error('❌ Error al consultar Habeas Data:', err);
        this.mensajeErrorHabeas = 'Ocurrió un error al consultar Habeas Data.';
        this.mensajeEstadoHabeas = null;
      }
    }
  });
}



  onAutorizacionChange(value: any) {

    if (value.label == 'No') {
      this.openModal();
    } else {
      this.closeModal();
    }
  }

  cargarLista() {
    const identificacion = localStorage.getItem('token');
    const paciente = this.formHabeas.get('identificacion')?.value;

    if (!identificacion || !paciente) {
      console.warn('⚠️ No se puede construir la URL, faltan parámetros.');
      return;
    }
    this.urlMotivosHabeas = API_URLS.motivosHabeas;

    this.urlCargarLista = API_URLS.cargarListaMedicos.cargarLista(identificacion, paciente, 'N');
  }



  openModal() {
    this.cargarLista();
    this.showModal = true;
  }
  closeModal() {
    this.showModal = false;
  }
  onReset() {
  this.formHabeas.reset();
  this.codigo=0;
  this.estadosHabeas = []; // <- Aquí limpias visualmente el *ngFor
  this.showModal = false;
  this.showModalHabeas = false;
  this.showModalRegistro = false;
  this.registroHabilitado = false;
}
  onSubmit() {
    if (this.formHabeas.valid) {
      //  console.log('Enviando formulario:', this.formHabeas.value);
    } else {
      this.formHabeas.markAllAsTouched();
    }
  }

  onSeleccion(value: any, type: 'medico' | 'motivo'): void {
    if (type === 'medico') {
      this.selectedMedicoId = value;
    } else {
      this.selectedMotivoId = value;
    }
    console.log(`✅ Seleccionado ${type}:`, value);
  }


  registerHabeas(tipo:string): void {
    this.crearCodigo();

this.enviarCodigo(
  `Suministre este codigo ${this.codigo} para autorizar tratamiento de datos. Para conocer el contenido de la autorización ir a www.hptu.org.co/privacy-policy.html`,
  this.formHabeas.get('celular')!.value
);

    const body = {
      idMedico: +this.selectedMedicoId,
      idAplicacion: 3,
      idMotivo: !this.selectedMotivoId || isNaN(+this.selectedMotivoId) ? 1 : +this.selectedMotivoId,

      noIdentificacion: this.formHabeas.get('identificadorUnico')!.value,
      tipoId: this.formHabeas.get('tipoDocumento')!.value,
      fechaAprobacion: new Date().toISOString().substring(0, 10),
      aprobacion: tipo,
      idColaborador: localStorage.getItem('token'),
      nombreColaborador: localStorage.getItem('nombre'),
      puntoAtencion: localStorage.getItem('punto'),
      medioAutorizacion: 'Digital',
      codigo: this.codigo,
      historia: this.formHabeas.get('identificacion')!.value,
      correoEnviado: this.formHabeas.get('correoElectronico')!.value
    };

    console.log('📤 Enviando body a backend:', body);

    this.apiService
      .post<ApiResponse<any>>(API_URLS.registrarHabeas, body)
      .subscribe({
        next: (response: ApiResponse<any>) => {
          console.log('✅ Registro exitoso:', response);
          this.showModal = false;
        },
        error: (err: HttpErrorResponse) => {
          console.error('❌ Error al registrar Habeas:', err);
        }
      });
  }


  openModalRegistrar() {
    const identificacion = localStorage.getItem('token');
    const paciente = this.formHabeas.get('identificacion')?.value;
    this.urlCargarLista = API_URLS.cargarListaMedicos.cargarLista(identificacion!, paciente, '');
   this.showModalRegistro = true;
  }

crearCodigo(){
 this.codigo=Math.floor(100000 + Math.random() * 900000)
}

 enviarSms( tipo:string) {

  this.registerHabeas(tipo);
  this.showModalRegistro = false; // cierra el primer modal
  setTimeout(() => {
    this.showModalHabeas = true; // abre el segundo modal con un retardo
  }, 200);
}


enviarCodigo(mensaje:string,  destinatario:string){

 const body = {mensaje:mensaje, destinatario:destinatario}
   this.apiService
      .post<ApiResponse<any>>(API_URLS.enviarSMS,body )
      .subscribe({
        next: (response: ApiResponse<any>) => {
          console.log('✅ Envio smsm exitoso:', response);

        },
        error: (err: HttpErrorResponse) => {
          console.error('❌ Error al enviar el código al paciente:', err);
        }
      });
}


validarCodigo() {
  const body = {
    noIdentificacion: this.formHabeas.get('identificacion')?.value,
    codigo: this.codigo
  };

this.apiService
  .post<ValidarCodigoResponse>(API_URLS.validarCodigo, body)
  .subscribe({
    next: (response) => {
      if (response.success) {
        alert('✅ Código validado y aprobado.');
      } else {
        alert('⚠️ Código no válido o ya aprobado.');
      }
    },
    error: (err: HttpErrorResponse) => {
      alert('❌ Error al validar el código.');
    }
  });

}
}
