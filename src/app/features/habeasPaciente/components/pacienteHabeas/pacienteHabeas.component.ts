import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { DividerModule } from 'primeng/divider';
import { NavbarComponent } from '../../../../shared/navbar/navbar.component';
import { PrimeNGModule } from '../../../../ui/primeng/primeng.module';
import { InputComponent } from '../../../../shared/input-text/input-text.component';
import { API_URLS } from '../../../../core/config/apiConfig';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse, HttpParams, HttpResponse } from '@angular/common/http';
import { ApiResponse, PacienteResponse } from '../../interfaces/PacienteResponse.interface';
import { ApiService } from '../../../../core/api/api.service';
import { ModalComponent } from "../../../../shared/modal/modal.component";

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
    ModalComponent
],
  templateUrl: './pacienteHabeas.component.html',
  styleUrls: ['./pacienteHabeas.component.css'],
})
export class PacienteHabeasComponent implements OnInit, OnDestroy {
  formHabeas!: FormGroup;
    showModal = false;

  private formChangesSub!: Subscription;
   mensajeErrorHabeas: string | null = null;
   mensajeErrorBusquedad: string | null = null;


  tipoDocumentoOptions = [
    { label: 'Cédula de Ciudadanía', value: 'CC' },
    { label: 'Tarjeta de Identidad', value: 'TI' },
    { label: 'Cédula de Extranjería', value: 'CE' },
  ];

  RespuestaHabeas = [
    { label: 'Si', value: 'Si' },
    { label: 'No', value: 'No' },
  ];

   motivosHabeas = [
  { label: 'Urgencia médica',                       value: 'UM'   }, // U=Urgencia, M=Médica
  { label: 'Condición clínica paciente',            value: 'CCP'  }, // C=Condición, C=Clínica, P=Paciente
  { label: 'Condición mental paciente',             value: 'CMP'  }, // C=Condición, M=Mental, P=Paciente
  { label: 'Menor de edad sin representante legal', value: 'MERL' }, // M=Menor, E=Edad, RL=Rep. Legal
  { label: 'No especifica',                         value: 'NE'   }  // N=No, E=Especifica
];
  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
        private apiService: ApiService

  ) {}

  ngOnInit(): void {
    this.formHabeas = this.fb.group({
    // Estos dos se habilitan desde el inicio
    tipoDocumento:      [null, Validators.required],
    identificadorUnico: ['', Validators.required],


    identificacion:     [{ value: '', disabled: true }, Validators.required],
    nombresPaciente:    [{ value: '', disabled: true }, Validators.required],
    primerApellido:     [{ value: '', disabled: true }, Validators.required],
    segundoApellido:    [{ value: '', disabled: true }, Validators.required],
    celular:            [{ value: '', disabled: true }, Validators.required],
    fechaNacimiento:    [{ value: '', disabled: true }, Validators.required],
    correoElectronico:  [{ value: '', disabled: true }, [Validators.required, Validators.email]],
    autorizacionHabeas: [{ value: null, disabled: true }, Validators.required]
  });
    this.mensajeErrorHabeas = null;
    this.mensajeErrorBusquedad=null;

    // Si quieres disparar la validación cuando usuario cambie ambos campos:
 this.formChangesSub = this.formHabeas.valueChanges
  .pipe(
    debounceTime(400),
    distinctUntilChanged((prev, curr) =>
      prev.tipoDocumento === curr.tipoDocumento &&
      prev.identificadorUnico === curr.identificadorUnico
    )
  )
  .subscribe(valores => {
    const { tipoDocumento, identificadorUnico } = valores;

    // Sólo llama ambas funciones si ambos campos están válidos
    if (
      this.formHabeas.get('tipoDocumento')!.valid &&
      this.formHabeas.get('identificadorUnico')!.valid
    ) {
      // Llamar primero a consultarInformacionPaciente()

        this.mensajeErrorHabeas = null;
    this.mensajeErrorBusquedad=null;
      this.consultarInformacionPaciente();

      // Luego a consultarHabeas()
      this.consultarHabeas();
    }
  });

  }

 consultarInformacionPaciente(): void {
    // 1) Sacamos los valores del FormGroup
    const tipoDocumento      = this.formHabeas.get('tipoDocumento')!.value;
    const identificadorUnico = this.formHabeas.get('identificadorUnico')!.value;

    // 2) Construimos la URL de infoPaciente
    const urlInfoPaciente = API_URLS.administradorHabeas
      .consultaInformacion( identificadorUnico,tipoDocumento);

      console.log("url buscar"+urlInfoPaciente);
    // 3) Llamamos a ApiService.getResponse() para leer status y body
    this.apiService
      .getResponse<ApiResponse<PacienteResponse>>(urlInfoPaciente)
      .subscribe({
        next: (response: HttpResponse<ApiResponse<PacienteResponse>>) => {
          // 3a) Si el status HTTP es 200 y hay body
          if (response.status === 200 && response.body) {
            const apiResp = response.body;

            // 3b) Si hay un objeto en results → existe paciente
            if (apiResp.results) {
              const datos: PacienteResponse = apiResp.results;

              // 3c) PatchValue en el formulario con los valores del WS
              this.formHabeas.patchValue({
                identificacion:    datos.numPaciente,
                nombresPaciente:   datos.nombres,
                primerApellido:    datos.apellido1,
                segundoApellido:   datos.apellido2,
                celular:           datos.celular,
                fechaNacimiento:   datos.fechaNacimiento,
                correoElectronico: datos.correo
                // NOTA: no parcheamos tipoDocumento ni identificadorUnico
              });
          this.formHabeas.get('autorizacionHabeas')!.enable();

              console.log('Paciente existe (200):', datos);
            } else {
                this.mensajeErrorBusquedad = 'No se encuentra infomación del paciente';
              console.warn('Status 200 pero “results” está vacío.');
            }
          }
        },
        error: (err: HttpErrorResponse) => {
          // 4) Si el servidor responde 404 o hay otro error
          if (err.status === 404) {
            console.warn('No existe el paciente (404).');
            this.mensajeErrorBusquedad = 'No se encuentra infomación del paciente';
          } else {
            console.error('Error al consultar información del paciente:', err);
          }
        }
      });
  }


  ngOnDestroy(): void {
    this.formChangesSub.unsubscribe();
  }

  /**
   * Este método lee los valores de los controles y construye la URL con comillas simples dentro.
   */
  consultarHabeas() {
    // 1) Sacamos los valores directamente del FormGroup:
    const tipoDocumento = this.formHabeas.get('tipoDocumento')!.value;
    const identificadorUnico = this.formHabeas.get('identificadorUnico')!.value;

    // 2) Mostramos en consola para verificar:
    console.log('Tipo de documento:', tipoDocumento);
    console.log('Identificación:', identificadorUnico);

   const urlEstadoHabeas= API_URLS.administradorHabeas.consultaEstadoHabeas(identificadorUnico,tipoDocumento);
    console.log('URL a consumir:', urlEstadoHabeas);

    // 4) Consumimos con HttpClient:
    this.http.get(urlEstadoHabeas, { observe: 'response' }).subscribe({
      next: response => {
        if (response.status === 200) {
          console.log('Paciente existe (200).');
        }
      },
      error: err => {
        if (err.status === 404) {
        this.mensajeErrorHabeas = 'El usuario no registra Habeas Data';

          console.warn('No existe el paciente (404).');
        } else {
          console.error('Error al consultar Habeas:', err);
        }
      }
    });
  }


  onAutorizacionChange(value: any) {
    console.log(value)
    if (value.label == 'No') {
      this.openModal();
    } else {
      this.closeModal();
    }
  }
 openModal() {
    this.showModal = true;
  }
  closeModal() {
    this.showModal = false;
  }


  // Función para reiniciar el formulario
  onReset() {
    this.formHabeas.reset();
  }

  // Función para enviar el formulario completo
  onSubmit() {
    if (this.formHabeas.valid) {
      console.log('Enviando formulario:', this.formHabeas.value);
      // Aquí podrías llamar a registrarHabeas() o similar
    } else {
      console.log('Formulario no válido');
      this.formHabeas.markAllAsTouched();
    }
  }
}
