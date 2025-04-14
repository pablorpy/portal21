export interface ConstruccionModel
{
    nroFilaConstruccion: number;
	anioConstruccion: number;
	area: number;
	borrado: string;
	categoriaConstruccion: string;
	ctaCte: string;
	obs: string;
	tipoConstruccion: string;
}

export interface ConstruccionPagination
{
    length: number;
    size: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}
