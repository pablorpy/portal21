import { User } from "app/core/user/user.types";

export interface EstadoCivilModel
{
    id: string;
    fechaAlta?: string;
    fechaModificacion?: string;
    descripcion?: string | null;
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