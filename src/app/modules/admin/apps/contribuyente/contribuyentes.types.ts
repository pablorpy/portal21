import { OpcionModel as OpcionModel } from "../parametros/dominios/dominios.types";

export interface ContribuyenteModel
{
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

export interface CategoriaCuenta
{
    tipo: 'folder' | 'multas' | 'devoluciones';
    nombre: string;
}