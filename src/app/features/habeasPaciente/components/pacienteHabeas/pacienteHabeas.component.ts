import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
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
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { SelectItem } from 'primeng/api';
import { TIPO_DOCUMENTO_OPTIONS } from '../../../../shared/constants/tipo-documento.constants';
import { ToastModule } from "primeng/toast";
import { ToastHelperService } from '../../../../shared/helpers/ToastHelperService';

@Component({
  selector: 'app-paciente-habeas',
  standalone: true,
  imports: [
    DialogModule,
    ButtonModule,
    CommonModule,
    ReactiveFormsModule,
    NavbarComponent,
    PrimeNGModule,
    DividerModule,
    InputComponent,
    ModalComponent,
    ListSelectLoaderComponent,
    ToastModule
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
  codigo!:any;
  public urlCargarLista = "";
  public urlMotivosHabeas = "";
  private formChangesSub!: Subscription;
  mensajeErrorHabeas: string | null = null;
  mensajeErrorBusquedad: string | null = null;
  mensajeEstadoHabeas: any | null = null;
  selectedMedicoId!: any;
  selectedMotivoId!: string;
  identificacion!: any;
  mostrarModalCodigoInvalido: boolean = false;
  mensajeCodigo: string | null = null;
  habilitarAceptarRegistro: boolean = false;
  habilitarAceptar: boolean = false;
  aplicacionRol=localStorage.getItem('rol');

@ViewChild('motivoSelectRef', { static: false }) motivoSelectRef!: ListSelectLoaderComponent;
@ViewChild('medicoNoSelectRef', { static: false }) medicoNoSelectRef!: ListSelectLoaderComponent;
@ViewChild('medicoSiSelectRef', { static: false }) medicoSiSelectRef!: ListSelectLoaderComponent;




tipoDocumentoOptions: SelectItem[] = TIPO_DOCUMENTO_OPTIONS;

estadosHabeas:  {
  tipo: 'P' | 'S' | 'N',
  medico: string,
  fecha: string,
  motivo: string,
  codigo?:string
}[] = [];
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
    private apiService: ApiService,
      private toast: ToastHelperService

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
      autorizacionHabeas: [{ value: null, disabled: true }, Validators.required],

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
            this.toast.error('Busqueda pacientes', 'Error al consultar información del paciente'),
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
const aplicacion=localStorage.getItem('rol');
  const url = API_URLS.administradorHabeas.consultaEstadoHabeas(
    identificadorUnico,
    tipoDocumento,
    aplicacion!
  );

  this.apiService.getResponse<ApiResponse<HabeasData | HabeasData[]>>(url).subscribe({
    next: (response: HttpResponse<ApiResponse<HabeasData | HabeasData[]>>) => {
      console.log('✅ Respuesta completa del backend:', response);

      const data = response.body?.results;

      if (!data) {
        console.warn('⚠️ Respuesta sin datos de habeas.');
        this.mensajeErrorHabeas = 'No se encontró información de Habeas Data.';
        this.mensajeEstadoHabeas = null;
        return;
      }

      this.formHabeas.get('autorizacionHabeas')?.enable();
      this.formHabeas.get('autorizacionHabeas')?.setValue('Si');

      const registros = Array.isArray(data) ? data : [data];
        console.log(registros);

      this.estadosHabeas = registros.map((r) => ({
        tipo: r.aprobacion as 'P' | 'S' | 'N',
        medico: r.nombreMedico || 'Médico no especificado',
        fecha: r.fechaRegistro || 'Fecha no registrada',
        motivo: r.descripcion || 'Sin motivo registrado',
        codigo:r.codigo,
      }));

      console.log('🧾 Estados Habeas construidos:', this.estadosHabeas);
    },

  error: (err: HttpErrorResponse) => {
  console.log('Error HTTP recibido:', err);
              //this.toast.error('Busqueda pacientes', 'Error al consultar información del paciente'),

  this.estadosHabeas = []; // ← limpiar para evitar mostrar resultados anteriores

  if (err.status === 404) {
    this.mensajeErrorHabeas = 'El usuario no registra Habeas Data.';
    this.mensajeEstadoHabeas = null;
  } else {
    this.mensajeErrorHabeas = 'Ocurrió un error al consultar el Habeas Data del paciente';
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
  // /this.onReset();



  this.showModal = false;
}


  onReset() {
setTimeout(() => {
    this.motivoSelectRef?.clearSelection?.();
    this.medicoNoSelectRef?.clearSelection?.();
    this.medicoSiSelectRef?.clearSelection?.();
  });
  this.formHabeas.reset();
  this.selectedMotivoId="";
this.selectedMotivoId ="";
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
private validarEstadoAceptar(): void {

  console.log('Entraaa',this.TipoHabeas.length,this.aplicacionRol);
  if (this.aplicacionRol !='5' && this.TipoHabeas.length >0){

 this.habilitarAceptarRegistro =true;
  }else if (this.aplicacionRol =='5'){
  this.habilitarAceptarRegistro = !!this.selectedMedicoId && this.TipoHabeas.length >0;

  }

}



private validarEstado(){

this.habilitarAceptar=!!this.selectedMedicoId  && !!this.TipoHabeas ;
 console.log(this.habilitarAceptar)
}

  onSeleccion(value: any, type: 'medico' | 'motivo'): void {
    if (type === 'medico') {
      this.selectedMedicoId = value;
    } else {
      this.selectedMotivoId = value;
    }

    //this.validarEstadoAceptar();
//console.log(this.selectedMotivoId +' '+this.aplicacionRol);
if (this.selectedMedicoId && this.selectedMotivoId ) {
 this.validarEstado();

}else if (this.selectedMotivoId && this.aplicacionRol !='5'){
this.habilitarAceptar=true;
}

    //console.log(`✅ Seleccionado ${type}:`, value);
  }

  onSeleccionMedio(value: string): void {

  this.formHabeas.get('medioAutorizacion')?.setValue(value);




  this.validarEstadoAceptar();
}

 enviarCodigos(codigo: any): void {
  const celular = this.formHabeas.get('celular')?.value;

  if (!celular) {
    console.warn('⚠️ Celular no definido');
    return;
  }

  const mensaje = `Suministre este código ${codigo} para autorizar tratamiento de datos. Para conocer el contenido de la autorización, visite www.hptu.org.co/privacy-policy.html`;
  this.showModalHabeas=true;
  this.enviarCodigo(mensaje, celular);
}


  registerHabeas(tipo:string): void {
    this.crearCodigo();
    let idaplicacion=2;
    if (tipo=='P'){
const nombre= this.formHabeas.get('nombresPaciente')!.value + " " + this.formHabeas.get('primerApellido')!.value + " "+ this.formHabeas.get('segundoApellido')!.value + " ";

this.enviarEmail(this.codigo,this.formHabeas.get('correoElectronico')!.value ,nombre);

this.enviarCodigos(this.codigo);
    }

    if (this.aplicacionRol =='5'){
        this.selectedMedicoId=null;
        this.selectedMotivoId='6';
        idaplicacion=2
    }

    const body = {
      idMedico: +this.selectedMedicoId,
      idAplicacion: idaplicacion,
      idMotivo: !this.selectedMotivoId || isNaN(+this.selectedMotivoId) ? 1 : +this.selectedMotivoId,

      noIdentificacion: this.formHabeas.get('identificacion')!.value,
      tipoId: this.formHabeas.get('tipoDocumento')!.value,
      fechaAprobacion: new Date().toISOString().substring(0, 10),
      aprobacion: tipo,
      idColaborador: localStorage.getItem('token'),
      nombreColaborador: localStorage.getItem('nombre'),
      puntoAtencion: localStorage.getItem('punto'),
      medioAutorizacion: 'Digital',
      codigo: this.codigo,
      historia: this.formHabeas.get('identificadorUnico')!.value,
      correoEnviado: this.formHabeas.get('correoElectronico')!.value
    };

    console.log('📤 Enviando body a backend:', body);

    this.apiService
      .post<ApiResponse<any>>(API_URLS.registrarHabeas, body)
      .subscribe({
        next: (response: ApiResponse<any>) => {
          console.log('✅ Registro exitoso:', response);
                                this.toast.success('Registro pacientes', '✅ Registro exitoso del paciente'),

          this.showModal = false;
        },
        error: (err: HttpErrorResponse) => {
                      this.toast.error('Registro pacientes', 'Error al registrar  el paciente'),

          console.error('❌ Error al registrar Habeas:', err);
        }
      });
  }


  openModalRegistrar() {
    const identificacion = localStorage.getItem('token');
    const paciente = this.formHabeas.get('identificacion')?.value;

    this.urlCargarLista = API_URLS.cargarListaMedicos.cargarLista(identificacion!, paciente, 'S');
    //console.log( this.urlCargarLista);
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


enviarEmail(codigo: string, emailpac: string, paciente: string) {
  const body = { codigo, emailpac, paciente };
  console.log('correo');
  console.log(body);

  this.apiService
    .post1(API_URLS.enviarEmail, body, { responseType: 'text' })
    .subscribe({
      next: (response: string) => {
        console.log('✅ Envío email exitoso:', response);

      },
      error: (err: HttpErrorResponse) => {
        console.error('❌ Error al enviar el código al paciente:', err);
                                                this.toast.error('Envio de email', 'Error al enviar email')

      }
    });
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
                                                  this.toast.success('Envio de sms', 'Error al enviar el código al paciente')

        }
      });
}


validarCodigo() {
  const body = {
    noIdentificacion: this.formHabeas.get('identificacion')?.value,
    codigo: this.formHabeas.get('codigo')?.value,
  };

 this.apiService.post<any>(API_URLS.validarCodigo, body)
  .subscribe({
    next: (response) => {
      if (response.success === true) {
        console.log('✅ Código válido');
        this.showModalHabeas = false;
        this.mostrarModalCodigoInvalido = false;
      } else {
        console.warn('⚠️ Código no válido');
        this.mensajeCodigo = '⚠️ Código incorrecto o ya aprobado.';
        this.mostrarModalCodigoInvalido = true;
      }
    },
    error: (err: HttpErrorResponse) => {
      console.error('❌ Error al validar el código:', err);
      this.mensajeCodigo = '❌ Error al validar el código. Intente nuevamente.';
                                                        this.toast.error('Error validación código', 'Error al validar el código. Intente nuevamente')

      this.mostrarModalCodigoInvalido = true;
    }
  });

}




}
