import { ContribuyenteModel } from "../../contribuyente/contribuyentes.types";
import { OpcionModel } from "../../parametros/dominios/dominios.types";

export interface InmuebleModel
{
    id?: string;
    ctaCorrientePadron?: string;
    direccionInmueble?: string;
    contribuyente?: ContribuyenteModel;
    fincaInmueble?: string;
    pisoInmueble?: string;
    dptoInmueble?: string;
    numCasaInmueble?: string;
    superficieEdificadoM2?: number;
    superficieTierraM2?: number;
    antiguedadEdificacion?: number;
    metrosLinealNorte?: number;
    metrosLinealSur?: number;
    metrosLinealEste?: number;
    metrosLinealOeste?: number;
    cantidadPlantas?: number;
    recoleccionBasura?: boolean;
    superficieTierraHa?: number;
    barridoLimpieza?: number;
    fechaInscripcion?: string;
    longitud?: string;
    latitud?: string;
    anhoConstruccion?: number;
    zonaCatastro?: string;
    manzanaCatastro?: string;
    loteCatastro?: string;
    pisoCatastro?: string;
    salonCatastro?: string;
    padronCatastro?: string;
    categoriaEdificacion?: OpcionModel;
    leido?: boolean;
    /*zonaCatastro
   /* categoria?: OpcionModel;
    grupoSanguineo?: OpcionModel;
    examenVistaOido?: boolean;
    examenTeoricoPractico?: boolean;
    numeroPasaporte?: string;
    carnetInmigracion?: string;
    fechaRenovacion?: Date;
    fechaValidez?: Date;
    conceptoPago?: OpcionModel;
    fechaCancelacion?: Date;
    estadoRegistro?: OpcionModel;*/
}

export interface InmueblePagination
{
    length: number;
    size: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}

export interface InmuebleCuentaModel
{
    id?: string;
	inmueble?: InmuebleModel;
    contribuyente?: ContribuyenteModel;
    anho?: number;
    numFinanciacion?: number;
	fechaVencimiento?: string;
	totalPagar?: number;
	totalPagado?: number;
	fechaPago?: string;
	estado?: OpcionModel;
    valorTierra?: number;
    valorEdificado?: number;
    valorAdicional?: number;
    valorOficial?: number;
	fechaFacturacion?: string;
	numFactura?: string;
	numExpediente?: string;
    fechaExpediente?: string;
	numResolucion?: number;
	fechaResolucion?: string;
	fechaExoneracion?: string;
	exonerado?: boolean;
	codigoExoneracion?: string;
	montoExonerado?: number;
	fechaEmisionCarnet?: string;
	exoneradoPor?: String;
	prescriptoPor?: string;
	serie?: string;
	fechaPrescripcion?: string;
	enoneracionRecargo?: boolean;
    fechaHoraCreacion?: string;
    usuarioCreacion?: string;
    fechaHoraUltModif?: string;
    usuarioUltModif?: string;
}

export interface InmuebleCuentaDetalleModel
{
    id?: string;
    descuentoAprobadoPor?: string;
	descuentoSolicitadoPor?: string;
	inmuebleCuenta?: InmuebleCuentaModel;
	rubro?: OpcionModel;
	importePagar?: number;
	montoDescuento?: number;
	nroItem?: number;
	porcentajeDescuento?: number;
}
