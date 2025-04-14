export interface NacionalidadModel
{
    id: string;
    codigo: string;
    descripcion: string;
    estado: string | null;
    nacionalidad: NacionalidadModel;
}
/*
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
    id: string;
    dominio: DominioModel;
    codigo: string;
    descripcion: string;
    estado: string;
}*/
