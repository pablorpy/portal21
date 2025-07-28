import { User } from "app/core/user/user.types";
import { DepartamentoModel } from "../departamentos/departamentos.types";

export interface CiudadModel
{
    id: string;
    fechaAlta?: string;
    fechaModificacion?: string;
    nombre?: string | null;
    departamento?: DepartamentoModel;
    usuarioAlta?: User | UsuarioModel;
    usuarioModificacion?: User | UsuarioModel;
}

export interface GenericPagination
{
    length: number;
    size: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}



export interface UsuarioModel
{
    id?: number;
}


export enum OperadoresWhere {
    LIKE = "LIKE",
    EQUAL = "EQUAL",
    BETWEEN = "BETWEEN",
    IN = "IN",
    MAYOR_O_IGUAL = ">=",
    MENOR_O_IGUAL = "<=",
    MAYOR = ">",
    MENOR = "<"
  }