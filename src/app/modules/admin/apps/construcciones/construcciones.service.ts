import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { BehaviorSubject, filter, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { AuthService } from 'app/core/auth/auth.service';
import { ConstruccionModel, ConstruccionPagination } from './construcciones.types';

@Injectable({ providedIn: 'root' })
export class ConstruccionesService {
    [x: string]: any;
    // Private
    private _construcciones: BehaviorSubject<ConstruccionModel[] | null> = new BehaviorSubject(null);
    private _construccion: BehaviorSubject<ConstruccionModel | null> = new BehaviorSubject(null);
    private _pagination: BehaviorSubject<ConstruccionPagination | null> = new BehaviorSubject(null);
    private _authService = inject(AuthService);
    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient) {
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
     */
    getConstrucciones_(page: number = 0, size: number = 10, sort: string = 'ctaCte', order: 'asc' | 'desc' | '' = 'asc', search: string = ''):
        Observable<any> {
        const headers = { 'Authorization': 'Bearer ' + this._authService.accessToken }
        console.log('entra en getConstrucciones_: token: ' + this._authService.accessToken + ' --- ' + search);
        console.log(`Request URL: ${AuthUtils.MUNISYS_BACKEND_URL_V2 + "/construcciones/paginado"}?page=${page}&size=${size}&sort=${sort}&order=${order}&search=${search}`);

        return this._httpClient.get<any>(AuthUtils.MUNISYS_BACKEND_URL_V2 + "/construcciones/paginado", {
            params: {
                page: '' + page,
                size: '' + size,
                sort,
                order,
                search: '' + search,
            },headers })
            .pipe(tap((response) => {
                console.log(response);
                this._pagination.next(response.pagination);
                this._construcciones.next(response.data);
                console.log(this.construcciones$)
            }),
        );
        
    }

     getConstruccionByCtaCteArray_(cuentaCorriente: string): Observable<ConstruccionModel[]>
                {
                    return this._httpClient.get<ConstruccionModel[]>(AuthUtils.MUNISYS_BACKEND_URL_V2 + "/construcciones/by-cta-cte/" + cuentaCorriente)
                        .pipe(tap((valor) => {
                            this._construcciones.next(valor);
                            console.log(this.construcciones$)
                        }),
                    );
                }


  /*  getDominiosPadres(): Observable<DominioModel[]> {
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
    getDominioByNFila(fila: number): Observable<ConstruccionModel> {
        return this._httpClient.get<ConstruccionModel>(AuthUtils.MUNISYS_BACKEND_URL_V2 + "/construcciones/by-nro-fila/" + fila)
            .pipe(tap((construccion) => {
                this._construccion.next(construccion);
            }),
            );
    }

    /**
     * Crear producto
     */
    createConstruccion(): Observable<ConstruccionModel> {
        const newDominio: ConstruccionModel = {
            nroFilaConstruccion: 0,
            anioConstruccion: 0,
            area: 0,
            borrado: '',
            categoriaConstruccion: '',
            ctaCte: '',
            obs: '',
            tipoConstruccion: ''
        };

        return this.construcciones$.pipe(
            take(1),
            map(dominios => {
                // Agregar el nuevo dominio a la lista
                this._construcciones.next([newDominio, ...dominios]);

                // Devolver el nuevo dominio
                return newDominio;
            })
        );
    }

    /**
     * Update product
     *
     * @param id
     * @param product
     */
  /*  update(fila: string, dominio: ConstruccionModel): Observable<ConstruccionModel> {
        return this.construcciones$.pipe(
            take(1),
            switchMap(dominios => this._httpClient.put<ConstruccionModel>(AuthUtils.MUNISYS_BACKEND_URL + "/dominios", dominio)
                .pipe(
                    map((updatedDominio) => {
                        // Find the index of the updated product
                        const index = dominios.findIndex(item => item.id === id);

                        // Update the product
                        dominios[index] = updatedDominio;

                        // Update the products
                        this._dominios.next(dominios);

                        // Return the updated product
                        return updatedDominio;
                    }),
                    switchMap(updatedDominio => this.dominio$.pipe(
                        take(1),
                        filter(item => item && item.id === id),
                        tap(() => {
                            // Update the product if it's selected
                            this._dominio.next(updatedDominio);

                            // Return the updated product
                            return updatedDominio;
                        }),
                    )),
                )),
        );
    }*/

    /**
     * Delete the product
     *
     * @param id
     */
  /*  deleteDominio(id: string): Observable<boolean> {
        return this.dominios$.pipe(
            take(1),
            switchMap(dominios => this._httpClient.delete(AuthUtils.MUNISYS_BACKEND_URL + "/dominios/" + id).pipe(
                map((isDeleted: boolean) => {
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
