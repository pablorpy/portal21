
import { OpcionModel } from "../../parametros/dominios/dominios.types";

export interface TimbradoModel
{
    id: string;
    nroTimbrado?: number;
    cantidad?: number;
    tipoComprobante?: OpcionModel;
    factHasta?: string;
    factDesde?: string;
    fechaInicio?: string;
    fechaVencimiento?: string;
    estado?: OpcionModel;
    nroEstablecimiento?: string;
    puntoExpedicion?: string;
   
}

export interface TimbradoPagination
{
    length: number;
    size: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}



