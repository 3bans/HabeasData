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
import { ConsentRequest } from '../../interfaces/ConsentRequest.interface';
import { jsPDF } from 'jspdf';

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
  codigo?:string,
    punto:string;
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
console.log(this.aplicacionRol);
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
  let aplicaciones;
  const tipoDocumento = this.formHabeas.get('tipoDocumento')!.value;
  const identificadorUnico = this.formHabeas.get('identificadorUnico')!.value;
const aplicacion=localStorage.getItem('rol');

if (aplicacion =='5'){
 aplicaciones='2';
}else{
 aplicaciones='3';

}
  const url = API_URLS.administradorHabeas.consultaEstadoHabeas(
    identificadorUnico,
    tipoDocumento,
    aplicaciones
  );

  this.apiService.getResponse<ApiResponse<HabeasData | HabeasData[]>>(url).subscribe({
    next: (response: HttpResponse<ApiResponse<HabeasData | HabeasData[]>>) => {

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

this.registroHabilitado = !registros.some(r =>
  r.aprobacion === 'P' || r.aprobacion === 'S',
     this.registroHabilitado = false
);

      this.estadosHabeas = registros.map((r) => ({



        tipo: r.aprobacion as 'P' | 'S' | 'N',
        medico: r.nombreMedico || 'Médico no especificado',
        fecha: r.fechaRegistro || 'Fecha no registrada',
        motivo: r.descripcion || 'Sin motivo registrado',
        codigo:r.codigo,
        punto:r.punto
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

limpiar(){
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
}

  onReset() {
this.limpiar();
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

  //console.log('Entraaa',this.TipoHabeas.length,this.aplicacionRol);
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
  if (value === 'Fisico') {
      // 1) Datos actuales del formulario / contexto
      const profesionalNombre       = this.formHabeas.get('profesionalNombre')?.value || '';
      const profesionalDocumento    = this.formHabeas.get('profesionalDocumento')?.value || '';
      const pacienteNombre          = `${this.formHabeas.get('nombresPaciente')?.value || ''} ${this.formHabeas.get('primerApellido')?.value || ''}`.trim();
      const pacienteTipoDocumento   = this.formHabeas.get('tipoDocumento')?.value || '';
      const pacienteDocumento       = this.formHabeas.get('identificacion')?.value || '';
      const representanteNombre     = this.formHabeas.get('representanteNombre')?.value || '';
      const representanteTipoDoc    = this.formHabeas.get('representanteTipoDocumento')?.value || '';
      const representanteDocumento  = this.formHabeas.get('representanteDocumento')?.value || '';

      // 2) Fecha actual desglosada
      const today = new Date();
      const dia  = today.getDate();
      // mes en español
      const mes  = today.toLocaleDateString('es-CO', { month: 'long' });
      const ano  = today.getFullYear();

      // 3) Construimos el body según la interfaz ConsentRequest
      const consentReq: ConsentRequest = {
        profesionalNombre,
        profesionalDocumento,
        dia,
        mes,
        ano,
        pacienteNombre,
        pacienteTipoDocumento,
        pacienteDocumento,
        representanteNombre,
        representanteTipoDocumento: representanteTipoDoc,
        representanteDocumento
      };

      // 4) URL final con el ID de plantilla. Aquí '7' es solo un ejemplo:
      const idPlantilla = '7';
      const url = API_URLS.cargarTextohabeas(idPlantilla);


      // 4) Hacemos el POST esperando un text/plain
      this.apiService
        .post1(url, consentReq, { responseType: 'text' })
        .subscribe({

    next: (renderedText: string) => {
            // 5) Generación del PDF
            const doc = new jsPDF({ unit: 'pt', format: 'letter' });
            const margin      = 40;
            const pageWidth   = doc.internal.pageSize.getWidth();
            const pageHeight  = doc.internal.pageSize.getHeight();
            const usableWidth = pageWidth - margin * 2;
            const lineHeight  = 14;
            const fontSize    = 11;

            // Título centrado en la primera página
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(14);
            const title = 'Autorización de tratamiento de datos personales de pacientes:';
            const titleWidth = doc.getTextWidth(title);
            doc.text(title, (pageWidth - titleWidth) / 2, margin);

            // Preparamos el cuerpo
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(fontSize);
            const lines = doc.splitTextToSize(renderedText, usableWidth);

            // Escribimos justo debajo del título
            let cursorY = margin + 30;

            // Salto de página automático
            for (const line of lines) {
              if (cursorY + lineHeight > pageHeight - margin) {
                doc.addPage();
                cursorY = margin;
              }
              doc.text(line, margin, cursorY, {
                maxWidth: usableWidth,
                align: 'justify'
              });
              cursorY += lineHeight;
            }

            // Añadimos líneas de firma al final
            if (cursorY + lineHeight * 4 > pageHeight - margin) {
              doc.addPage();
              cursorY = margin;
            } else {
              cursorY += lineHeight;
            }

            const half = pageWidth / 2;
            doc.setFontSize(fontSize + 1);
            // Firma paciente
            doc.text('________________________', margin, cursorY);
            doc.text('Paciente', margin, cursorY + lineHeight);
            doc.text('Firma', margin, cursorY + lineHeight * 2);
            // Firma representante
            doc.text('________________________', half + margin / 2, cursorY);
            doc.text('*Representante legal/Apoyo', half + margin / 2, cursorY + lineHeight);
            doc.text('Firma', half + margin / 2, cursorY + lineHeight * 2);

            // 6) Abrimos el PDF
            const blobUrl = doc.output('bloburl');
            window.open(blobUrl, '_blank');
          },
          error: (err: HttpErrorResponse) => {
            console.error('❌ Error al cargar texto Habeas:', err);
            this.toast.error('Habeas Data', 'No se pudo cargar el texto de autorización');
          }
        });
    }




  this.validarEstadoAceptar();
}

 enviarCodigos(codigo: any, estado:any): void {
  const celular = this.formHabeas.get('celular')?.value;

  if (!celular) {
    console.warn('⚠️ Celular no definido');
    return;
  }

  const mensaje = `Suministre este código ${codigo} para autorizar tratamiento de datos. Para conocer el contenido de la autorización, visite www.hptu.org.co/privacy-policy.html`;
  if (estado=='R'){

    this.showModalHabeas=true;
}
  this.enviarCodigo(mensaje, celular);
}


  registerHabeas(tipo:string): void {
    this.crearCodigo();
    let idaplicacion=2;
    let idhabeas=1007;


    if (this.aplicacionRol !='5'){
        this.selectedMedicoId=null;
        this.selectedMotivoId='6';
        idhabeas=7;
        idaplicacion=3
    }

    const body = {
      idMedico: this.selectedMedicoId,
      idAplicacion: idaplicacion,
      idMotivo: !this.selectedMotivoId || isNaN(+this.selectedMotivoId) ? 1 : +this.selectedMotivoId,
      id_habeas:idhabeas,
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
           setTimeout(() => {
    this.showModalHabeas = true; // abre el segundo modal con un retardo
  }, 200);

             if (tipo=='P'){
const nombre= this.formHabeas.get('nombresPaciente')!.value + " " + this.formHabeas.get('primerApellido')!.value + " "+ this.formHabeas.get('segundoApellido')!.value + " ";

this.enviarEmail(this.codigo,this.formHabeas.get('correoElectronico')!.value ,nombre);

this.enviarCodigos(this.codigo,'');

    }


        },

        error: (err: HttpErrorResponse) => {
                      this.toast.error('Registro pacientes', 'Error al registrar  el paciente'),
this.showModalHabeas=false;
  this.limpiar();
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
          this.limpiar();
      } else {
        console.warn('⚠️ Código no válido');
        this.mensajeCodigo = '⚠️ Código incorrecto o ya aprobado.';
        this.mostrarModalCodigoInvalido = true;
      }
      //this.limpiar();
    },
    error: (err: HttpErrorResponse) => {
      console.error('❌ Error al validar el código:', err);
        this.limpiar();
      this.mensajeCodigo = '❌ Error al validar el código. Intente nuevamente.';
                                                        this.toast.error('Error validación código', 'Error al validar el código. Intente nuevamente')

      this.mostrarModalCodigoInvalido = true;
    }
  });

}




}
