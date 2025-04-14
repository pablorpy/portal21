import { ContribuyenteModel } from "../contribuyente/contribuyentes.types";
import { OpcionModel } from "../parametros/dominios/dominios.types";

export interface RegistroModel
{
    id: string;
    fechaExpedicion?: string;
    numeroRegistro?: string;
    contribuyente?: ContribuyenteModel;
    categoria?: OpcionModel;
    grupoSanguineo?: OpcionModel;
    examenVistaOido?: boolean;
    examenTeoricoPractico?: boolean;
    numeroPasaporte?: string;
    carnetInmigracion?: string;
    fechaRenovacion?: string;
    fechaValidez?: string;
    conceptoPago?: OpcionModel;
    fechaCancelacion?: string;
    estadoRegistro?: OpcionModel;
}

export interface RegistroPagination
{
    length: number;
    size: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}



