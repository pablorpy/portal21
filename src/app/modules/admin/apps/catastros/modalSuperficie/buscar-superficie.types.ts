export interface SuperficieModel
{
    id: number;
	borrado: string;
	ctaCte: string;
	posicion: number;
	subZona: number;
	superficieHa: number;
	superficieM2: number;
}

export interface SuperficiePagination
{
    length: number;
    size: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}