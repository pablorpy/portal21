import { User } from "app/core/user/user.types";
import { CiudadModel } from "../ciudades/ciudades.types";

export interface BarrioModel
{
    id: string;
    fechaAlta?: string;
    fechaModificacion?: string;
    nombre?: string | null;
    ciudad?: CiudadModel;
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

export interface DepartamentoModel
{
    id?: number;
    fechaAlta?: string;
    fechaModificacion?: string;
    nombre?: string;
    usuarioAlta?: User | UsuarioModel;
    usuarioModificacion?: User | UsuarioModel;
}

export interface UsuarioModel
{
    id?: number;
   // nombres?: string;
    //apellidos?: string;
    //usuario?: String;
    //email?: string;
    //password?: boolean;
    //avatar?: string;
   // status?: string;
   // estado?: string;
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