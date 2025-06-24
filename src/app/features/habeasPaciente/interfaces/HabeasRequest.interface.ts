interface HabeasRequest {
  noIdentificacion: string;
  tipoId: string;
  fechaAprobacion: string;     // "yyyy-MM-dd"
  aprobacion: boolean;
  idColaborador: string;
  nombreColaborador: string;
  puntoAtencion: string;
  medioAutorizacion: string;
  codigo: string;
  historia: string;
  correoEnviado: string;
  id_asignacion_habeas: number;
  id_motivo?: number;
}
