export interface EstadoHabeas {
  tipo: 'P' | 'S' | 'N';
  medico: string;
  fecha: string;
  motivo?: string;
  codigo:string;
}

