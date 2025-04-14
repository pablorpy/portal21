import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { BehaviorSubject, filter, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { AuthService } from 'app/core/auth/auth.service';
import { DimensionModel, DimensionPagination } from './buscar-dimension.types';
import { isNull } from 'lodash';

@Injectable({providedIn: 'root'})
export class DimensionService
{
    // Private
    private _dimensiones      : BehaviorSubject<DimensionModel[] | null> = new BehaviorSubject(null);
    private _dimension       : BehaviorSubject<DimensionModel | null> = new BehaviorSubject(null);
    private _pagination     : BehaviorSubject<DimensionPagination | null> = new BehaviorSubject(null);
    private _authService = inject(AuthService);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient)
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    get dimensiones$(): Observable<DimensionModel[]> {
        return this._dimensiones.asObservable();
    }

    get dimension$(): Observable<DimensionModel> {
        return this._dimension.asObservable();
    }

    get pagination$(): Observable<DimensionPagination> {
        return this._pagination.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Obtener Dominios
     *
     *
     * @param page
     * @param size
     * @param sort
     * @param order
     * @param search
     * @param operator
     */
    getDimensiones(page: number = 0, size: number = 10, sort: string = 'dimension', order: 'asc' | 'desc' | '' = 'asc', search: string = '', operator: string = 'LIKE'):
        Observable<any> {
        const headers = { 'Authorization': 'Bearer ' + this._authService.accessToken }
        //console.log('token: ' + this._authService.accessToken);
       // console.log(`Request URL: ${AuthUtils.MUNISYS_BACKEND_URL_V2 + "/dimensiones/paginado"}?page=${page}&size=${size}&sort=${sort}&order=${order}&search=${search}`);

        return this._httpClient.get<any>(AuthUtils.MUNISYS_BACKEND_URL_V2 + "/dimensiones/paginado", {
            params: {
                page: '' + page,
                size: '' + size,
                sort,
                order,
                search,
                operator
            },headers })
            .pipe(tap((response) => {
                this._pagination.next(response.pagination);
                this._dimensiones.next(response.data);
            }),
        );
    }


  /*  getRegistrosPaginadoByNroCiContribuyente(nroCi: string = '', page: number = 0, size: number = 10, sort: string = 'id', order: 'asc' | 'desc' | '' = 'asc'):
    Observable<any> {

    const headers = { 'Authorization': 'Bearer ' + this._authService.accessToken }
    //console.log('token: ' + this._authService.accessToken);
    return this._httpClient.get<any>(AuthUtils.MUNISYS_BACKEND_URL + "/registros/paginado/nro-ci-contribuyente/" + nroCi, {
        params: {
            nroCi: nroCi,
            page: '' + page,
            size: '' + size,
            sort,
            order
        },headers })
        .pipe(tap((response) => {
            console.log("response.pagination: " + response.pagination);
            this._pagination.next(response.pagination);
            this._registros.next(response.data);
        }),
    );
}*/


   /* getDominiosPadres(): Observable<DominioModel[]> {
        return this._httpClient.get<DominioModel[]>(AuthUtils.MUNISYS_BACKEND_URL + "/dominios")
            .pipe(
                tap((dominios) => {
                    this._dominiosPadre.next(dominios);
                }),
            );
    }*/


    /**
     * Get dominio by id
     */
    getDimension(n_fila: number): Observable<DimensionModel>
    {
        return this._httpClient.get<DimensionModel>(AuthUtils.MUNISYS_BACKEND_URL_V2 + "/dimensiones/" + n_fila)
            .pipe(tap((valor) => {
                this._dimension.next(valor);
            }),
        );
    }

    getDimensionByCtaCteArray(cuentaCorriente: string): Observable<DimensionModel[]>
            {
                console.log(cuentaCorriente);
                return this._httpClient.get<DimensionModel[]>(AuthUtils.MUNISYS_BACKEND_URL_V2 + "/dimensiones/by-cta-cte/" + cuentaCorriente)
                    .pipe(tap((valor) => {
                        this._dimensiones.next(valor);
                    }),
                );
            }

            getDimensionByCtaCte(cuentaCorriente: string): Observable<DimensionModel>
            {
                console.log(cuentaCorriente);
                return this._httpClient.get<DimensionModel>(AuthUtils.MUNISYS_BACKEND_URL_V2 + "/dimensiones/by-cta-cte/" + cuentaCorriente)
                    .pipe(tap((valor) => {
                        this._dimension.next(valor);
                    }),
                );
            }

    /**
     * Crear registro
     */
    createDimension(): Observable<DimensionModel>
    {
        const newDimension: DimensionModel = {
            dimension: null,
            areaDimension: null,
            borrado: 'N',
            calle: '',
            callePrincipal: '',
            categoriaZona: '',
            ctaCte: '',
            desdeAnio: 2025,
            frentes: '',
            observacion: '',
            orientacion: '',
            posicion: 1,
            tramoCalle: 1,
            utm1x: '',
            utm1y: '',
            utm2x: '',
            utm2y: ''
        };

        return this.dimensiones$.pipe(
            take(1),
            map(dimensiones => {
              // Agregar el nuevo dominio a la lista
              this._dimensiones.next([newDimension, ...dimensiones]);

              // Devolver el nuevo dominio
              return newDimension;
            })
          );
    }

    /**
     * Update product
     *
     * @param id
     * @param dimension
     */
     updateDimension(n_fila: number, dimension: DimensionModel): Observable<DimensionModel>
    {
        const headers = { 'Authorization': 'Bearer ' + this._authService.accessToken }
        //console.log("token_update: " + headers.Authorization);
        return this.dimensiones$.pipe(
            take(1),
            switchMap(construcciones => this._httpClient.put<DimensionModel>(AuthUtils.MUNISYS_BACKEND_URL_V2 + "/dimensiones", dimension, {headers} )
            .pipe(
                map((updatedConstruccion) => {
                    // Find the index of the updated product
                    const index = construcciones.findIndex(item => item.dimension === n_fila);

                    // Update the product
                    construcciones[index] = updatedConstruccion;

                    // Update the products
                    this._dimensiones.next(construcciones);

                    // Return the updated product
                    return updatedConstruccion;
                }),
                switchMap(updatedConstruccion => this.dimension$.pipe(
                    take(1),
                    filter(item => item && item.dimension === n_fila),
                    tap(() => {
                        // Update the product if it's selected
                        this._dimension.next(updatedConstruccion);

                        // Return the updated product
                        return updatedConstruccion;
                    }),
                )),
            )),
        );
    }

    /**
     * Delete the product
     *
     * @param id
     
    deleteDominio(id: string): Observable<boolean>
    {
        return this.dominios$.pipe(
            take(1),
            switchMap(dominios => this._httpClient.delete(AuthUtils.MUNISYS_BACKEND_URL + "/dominios/" + id).pipe(
                map((isDeleted: boolean) =>
                {
                    // Find the index of the deleted product
                    const index = dominios.findIndex(item => item.id === id);

                    // Delete the product
                    dominios.splice(index, 1);

                    // Update the products
                    this._dominios.next(dominios);

                    // Return the deleted status
                    return isDeleted;
                }),
            )),
        );
    }*/
}
