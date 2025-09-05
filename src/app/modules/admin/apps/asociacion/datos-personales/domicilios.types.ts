import { User } from "app/core/user/user.types";

export interface DomicilioModel
{
    
    idDomicilio?: number;
	anhoResidenciaDomicilio?: number;
	barrioDomicilio?: string;
	coordenadaDomicilio?: string;
	ctaCatastralDomicilio?: string;
    direccionDomicilio?: string;
    fechaModifDomicilio?: string;
	idCiudad?: number;
	idDomicilioCategoria?: number;
    idDomicilioEstado?: number;
	idDomicilioTipo?: number;
	idDomicilioZona?: number;
	idPersonas?: number;
	idUsuario?: number;
	issanDomicilio?: string;
    nisDomicilio?: string;
	obsDomicilio?: string;
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