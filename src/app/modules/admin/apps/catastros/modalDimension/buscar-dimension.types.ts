export interface DimensionModel
{
    dimension: number;
	areaDimension: number;
	borrado: string;
	calle: string;
	callePrincipal: string;
	categoriaZona: string;
	ctaCte: string;
	desdeAnio: number;
	frentes: string;
	observacion: string;
	orientacion: string;
	posicion: number;
	tramoCalle: number;
	utm1x: string;
	utm1y: string;
	utm2x: string;
	utm2y: string;
}

export interface DimensionPagination
{
    length: number;
    size: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}