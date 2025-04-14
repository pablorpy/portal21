import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { BehaviorSubject, filter, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { AuthService } from 'app/core/auth/auth.service';
import { ConstruccionModel, ConstruccionPagination } from './buscar-construccion.types';

@Injectable({providedIn: 'root'})
export class ConstruccionService
{
    // Private
    private _construcciones       : BehaviorSubject<ConstruccionModel[] | null> = new BehaviorSubject(null);
    private _construccion        : BehaviorSubject<ConstruccionModel | null> = new BehaviorSubject(null);
    private _pagination     : BehaviorSubject<ConstruccionPagination| null> = new BehaviorSubject(null);
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

    get construcciones$(): Observable<ConstruccionModel[]> {
        return this._construcciones.asObservable();
    }

    get construccion$(): Observable<ConstruccionModel> {
        return this._construccion.asObservable();
    }

    get pagination$(): Observable<ConstruccionPagination> {
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
    getConstrucciones(page: number = 0, size: number = 10, sort: string = 'ctaCte', order: 'asc' | 'desc' | '' = 'asc', search: string = '', operator: string = 'LIKE'):
        Observable<any> {
        const headers = { 'Authorization': 'Bearer ' + this._authService.accessToken }
        //console.log('token: ' + this._authService.accessToken);
        console.log(`Request URL: ${AuthUtils.MUNISYS_BACKEND_URL_V2 + "/construcciones/paginado"}?page=${page}&size=${size}&sort=${sort}&order=${order}&search=${search}`);

        return this._httpClient.get<any>(AuthUtils.MUNISYS_BACKEND_URL_V2 + "/construcciones/paginado", {
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
                this._construcciones.next(response.data);
            }),
        );
    }

    /**
     * Get 
     */
    getConstruccionByNFila(n_fila: number): Observable<ConstruccionModel>
    {
        return this._httpClient.get<ConstruccionModel>(AuthUtils.MUNISYS_BACKEND_URL_V2 + "/construcciones/by-nro-fila/" + n_fila)
            .pipe(tap((valor) => {
                this._construccion.next(valor);
            }),
        );
    }

    getConstruccionByCtaCteArray(cuentaCorriente: string): Observable<ConstruccionModel[]>
    {
        return this._httpClient.get<ConstruccionModel[]>(AuthUtils.MUNISYS_BACKEND_URL_V2 + "/construcciones/by-cta-cte/" + cuentaCorriente)
            .pipe(tap((valor) => {
                this._construcciones.next(valor);
            }),
        );
    }

    /**
     * Crear 
     */
    createConstruccion(): Observable<ConstruccionModel>
    {
        const newConstruccion: ConstruccionModel = {
            nroFilaConstruccion: null,
            anioConstruccion: 2025,
            area: null,
            borrado: 'N',
            categoriaConstruccion: '',
            ctaCte: '',
            obs: '',
            tipoConstruccion: ''
        };

        return this.construcciones$.pipe(
            take(1),
            map(construcciones => {
              // Agregar el nuevo dominio a la lista
              this._construcciones.next([newConstruccion, ...construcciones]);

              // Devolver 
              return newConstruccion;
            })
          );
    }

    /**
     * Update product
     *
     * @param id
     * @param construccion
     */
     updateCOnstruccion(n_fila: number, construccion: ConstruccionModel): Observable<ConstruccionModel>
    {
        const headers = { 'Authorization': 'Bearer ' + this._authService.accessToken }
        //console.log("token_update: " + headers.Authorization);
        return this.construcciones$.pipe(
            take(1),
            switchMap(construcciones => this._httpClient.put<ConstruccionModel>(AuthUtils.MUNISYS_BACKEND_URL_V2 + "/construcciones", construccion, {headers} )
            .pipe(
                map((updatedConstruccion) => {
                    // Find the index of the updated product
                    const index = construcciones.findIndex(item => item.nroFilaConstruccion === n_fila);

                    // Update the product
                    construcciones[index] = updatedConstruccion;

                    // Update the products
                    this._construcciones.next(construcciones);

                    // Return the updated product
                    return updatedConstruccion;
                }),
                switchMap(updatedConstruccion => this.construccion$.pipe(
                    take(1),
                    filter(item => item && item.nroFilaConstruccion === n_fila),
                    tap(() => {
                        // Update the product if it's selected
                        this._construccion.next(updatedConstruccion);

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
