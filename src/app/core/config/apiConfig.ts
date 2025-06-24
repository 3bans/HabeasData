import { environment } from "../../../environments/environment";

export const API_URLS = {
  ldap: {
    postLDA: 'http://svr-helena:8086/hnsLogin-0.0.1-SNAPSHOT/ldap/ldapHns/',
  },
gateway: {
    login:`${environment.apiGateway}:${environment.apiPorts.postGateway}/habeasLogin/api/auth/login`,
      validarToken:`${environment.apiGateway}:${environment.apiPorts.postGateway}/habeasLogin/api/apps/`,
  },
  permisos: {
    postPermiso: `${environment.apiUrl}:${environment.apiPorts.postLDA}/ws_cargar_permisos/`,
  },


administradorHabeas: {
    consultaEstadoHabeas: (identificacion: string, tipoDocumento: string): string =>
      `${environment.apiGateway}:${environment.apiPorts.postGateway}/api/habeas/existe?noIdentificacion='${identificacion}'&tipoId='${tipoDocumento}'`,

    consultaInformacion: (identificacion: string, tipoDocumento: string): string =>
      `${environment.apiGateway}:${environment.apiPorts.postGateway}/api/paciente/buscar?tipoId='${tipoDocumento}'&numId='${identificacion}'`,

  },
  cargarListaMedicos:{
    cargarLista: (identificacion: string): string =>
      `${environment.apiGateway}:${environment.apiPorts.postGateway}/api/habeas/secretaria/'${identificacion}'`,
  },
    motivosHabeas:`${environment.apiGateway}:${environment.apiPorts.postGateway}/api/habeas/motivos`,
    registrarHabeas:`${environment.apiGateway}:${environment.apiPorts.postGateway}/api/habeas/registrar`,




}
