import { ContribuyenteModel } from "../contribuyente/contribuyentes.types";
import { ProformaDetalleModel } from "../contribuyente/estado-cuenta/estado-cuenta-box.types";
import { OpcionModel } from "../parametros/dominios/dominios.types";

export interface ProformaModel
{
    id: string;
    ruc?: string;
    nombreApellido?: string;
    contribuyente?: ContribuyenteModel;
    estado?: OpcionModel;
    observacion?: string;

    autorizante?: AutorizanteModel;
    fechaAutorizacion?: Date;

    porcentajeDescuento: number;
    montoDescuento: number;
    totalSinDescuento: number;
    totalAPagar: number;
    
    fechaHoraCreacion?: Date;
    usuarioCreacion?: number;
    fechaHoraUltModif?: Date;
    usuarioUltModif?: number;
    detalles: ProformaDetalleModel[];
}

export interface ProformaPagination
{
    length: number;
    size: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}

export interface AutorizanteModel
{
    id: string;
}

/*
export interface OpcionModel
{
    id?: number;
   // dominio?: DominioModel;
    codigo?: string;
    descripcion?: string;
    estado?: string;
    porDefecto?: boolean;
    icono?: string;
}*/
