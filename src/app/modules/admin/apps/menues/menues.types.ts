export interface DominioModel
{
    id: string;
    codigo?: string;
    descripcion?: string;
    estado?: string | null;
    dominioPadre?: DominioModel;
}

export interface DominioPagination
{
    length: number;
    size: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}

export interface OpcionModel
{
    id?: number;
    dominio?: DominioModel;
    codigo?: string;
    descripcion?: string;
    estado?: string;
    porDefecto?: boolean;
    icono?: string;
}
