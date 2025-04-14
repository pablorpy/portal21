import { OpcionModel as OpcionModel } from "../parametros/dominios/dominios.types";
import { AutorizanteModel, ProformaModel } from "../proformas/proformas.types";

export interface DetalleModel
{
    id: number;
    proformaCabecera?: ProformaModel;
    concepto?: OpcionModel;
    conceptoDescripcion?: string | null;
    cantidad?: number;
    costo?: number;
    exenta?: number;
    iva5?: number;
    iva10?: number;
    porcentajeDescuento?: number;
    montoDescuento?: number;
    autorizante?: AutorizanteModel;
    estado?: OpcionModel;
    observacion?: string;
    fechaHoraCreacion?: Date;
    usuarioCreacion?: number;
    fechaHoraUltModif?: Date;
    usuarioUltModif?: number;
    idCuenta?: number;
}

export interface DetallePagination
{
    length: number;
    size: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}

export interface DetalleDetalleModel
{
    id: number;
    proformaDetalle?: DetalleModel;
    conceptoAccesorio?: OpcionModel;
    conceptoAccesorioDescripcion?: string | null;
    cantidad?: number;
    costo?: number;
    exenta?: number;
    iva5?: number;
    iva10?: number;
    porcentajeDescuento?: number;
    montoDescuento?: number;
    autorizante?: AutorizanteModel;
    estado?: OpcionModel;
    observacion?: string;
    fechaHoraCreacion?: Date;
    usuarioCreacion?: number;
    fechaHoraUltModif?: Date;
    usuarioUltModif?: number;
    fechaHoraAutorizacion?: Date;
    idDetalleCuenta?: number;
}
