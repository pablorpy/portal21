import { NacionalidadModel } from "../contribuyente/nacionalidades/nacionalidad.types";
import { OpcionModel } from "../parametros/dominios/dominios.types";

export interface ContribuyenteModel
{
    [x: string]: any;
    id: string;
    rmc?: string;
    nombre?: string;
    apellido?: string | null;
    direccion?: string;
    nacionalidad?: OpcionModel;
    estadoCivil?: OpcionModel;
    tipoContribuyente?: OpcionModel;
    ciudad?: OpcionModel;
    barrio?: OpcionModel;
    estado?: OpcionModel;
    categoriaContribuyente?: OpcionModel;
    genero?: OpcionModel;
    cedulaIdentidad?: string;
    telefono?: string;
    celular?: string;
    fechaNacimiento?: string;
    correoElectronico?: string;
}

export interface ContribuyentePagination
{
    length: number;
    size: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}

/*export interface OpcionModel
{
    id?: string;
    codigo?: string;
    descripcion?: string;
    estado?: string;
}*/
