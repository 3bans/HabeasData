import { environment } from "../../../environments/environment";

export const API_URLS = {



gateway: {
    login:`${environment.apiGateway}:${environment.apiPorts.postGateway}/habeasLogin/api/auth/login`,
      validarToken:`${environment.apiGateway}:${environment.apiPorts.postGateway}/habeasLogin/api/apps/`,
  },
  permisos: {
    postPermiso: `${environment.apiUrl}:${environment.apiPorts.postLDA}/ws_cargar_permisos/`,
  },


administradorHabeas: {
consultaEstadoHabeas: (identificacion: string, tipoDocumento: string): string =>
  `${environment.apiGateway}:${environment.apiPorts.postGateway}/api/habeas/existe?noIdentificacion=${identificacion}&tipoId=${tipoDocumento}`,


    consultaInformacion: (identificacion: string, tipoDocumento: string): string =>
      `${environment.apiGateway}:${environment.apiPorts.postGateway}/api/paciente/buscar?tipoId='${tipoDocumento}'&numId='${identificacion}'`,

  },
  cargarListaMedicos:{
  cargarLista :(idUsuario: string, idPaciente: string, aprobacion: string): string =>
  `${environment.apiGateway}:${environment.apiPorts.postGateway}/api/habeas/secretaria/'${idUsuario}'/'${idPaciente}'/'${aprobacion}'`,
  },

    enviarSMS:`${environment.apiGateway}:${environment.apiPorts.postGateway}/api/habeas/enviar`,
   enviarEmail:`${environment.apiGateway}:${environment.apiPorts.postGateway}/api/habeas/enviarCorreo`,
    cargarRoles:`${environment.apiGateway}:${environment.apiPorts.postGateway}/api/roles/activos`,
     cargarPuntoServicio:`${environment.apiGateway}:${environment.apiPorts.postGateway}/api/puntoServicio/activos`,
    motivosHabeas:`${environment.apiGateway}:${environment.apiPorts.postGateway}/api/habeas/motivos`,
    registrarHabeas:`${environment.apiGateway}:${environment.apiPorts.postGateway}/api/habeas/registrar`,
    puntoServicio:`${environment.apiGateway}:${environment.apiPorts.postGateway}/api/oracle/servicios`,
    validarCodigo:`${environment.apiGateway}:${environment.apiPorts.postGateway}/api/habeas/validarCodigo`,
    cargarListaUsuarios:`${environment.apiGateway}:${environment.apiPorts.postGateway}/api/usuarios/listaUsuario`,
     crearUsuario:`${environment.apiGateway}:${environment.apiPorts.postGateway}/api/usuarios/crear`,
  actualizarUsuario:`${environment.apiGateway}:${environment.apiPorts.postGateway}/api/usuarios/actualizar`,
  registrarMedico: `${environment.apiGateway}:${environment.apiPorts.postGateway}/api/medicos/registrar`,
  actualizarMedico: `${environment.apiGateway}:${environment.apiPorts.postGateway}/api/medicos/actualizar`,
  cargarListaEspecialistas: `${environment.apiGateway}:${environment.apiPorts.postGateway}/api/medicos/activos`,
  cargarListaSecretarias: `${environment.apiGateway}:${environment.apiPorts.postGateway}/api/usuarios/secretarias`,
  asignacionMedicos:`${environment.apiGateway}:${environment.apiPorts.postGateway}/api/asignacionMedicos/asignar`,
   listaMedicosAsignados:`${environment.apiGateway}:${environment.apiPorts.postGateway}/api/asignacionMedicos/medicoSecretaria/`,
  eliminarAsignacionMedico: `${environment.apiGateway}:${environment.apiPorts.postGateway}/api/asignacionMedicos/secretariAsignada`



}
