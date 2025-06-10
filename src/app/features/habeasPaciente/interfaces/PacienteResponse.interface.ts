export interface PacienteResponse {
  numPaciente: string;
  docPaciente: string;
  apellido1: string;
  apellido2: string;
  fechaNacimiento: string;
  historia: string;
  nombres: string;
  telefono: string;
  celular: string;
  correo: string;
}


export interface ApiResponse<T> {
  code:        number;
  description: string;
  results:     T;
}
