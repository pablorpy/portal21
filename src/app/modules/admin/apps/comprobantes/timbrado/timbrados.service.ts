import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { BehaviorSubject, filter, first, map, Observable, switchMap, take, tap } from 'rxjs';
import { AuthService } from 'app/core/auth/auth.service';
import { TimbradoModel, TimbradoPagination } from './timbrados-types';

@Injectable({ providedIn: 'root' })
export class TimbradosService {
    // Private
    private _timbrados: BehaviorSubject<TimbradoModel[] | null> = new BehaviorSubject(null);
    private _timbrado: BehaviorSubject<TimbradoModel | null> = new BehaviorSubject(null);
    private _pagination: BehaviorSubject<TimbradoPagination | null> = new BehaviorSubject(null);
    //private _dominiosPadre   : BehaviorSubject<RegistroModel[] | null> = new BehaviorSubject(null);

    //private _opcionesDelDominio : BehaviorSubject<OpcionModel[] | null> = new BehaviorSubject(null);
    //private _opcionPadre        : BehaviorSubject<OpcionModel | null> = new BehaviorSubject(null);
    private _authService = inject(AuthService);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    get timbrados$(): Observable<TimbradoModel[]> {
        return this._timbrados.asObservable();
    }

    get timbrado$(): Observable<TimbradoModel> {
        return this._timbrado.asObservable();
    }

    get pagination$(): Observable<TimbradoPagination> {
        return this._pagination.asObservable();
    }
    /*
        get dominiosPadre$(): Observable<DominioModel[]> {
            return this._dominiosPadre.asObservable();
        }
    
        get opcionesDelDominio$(): Observable<OpcionModel[]> {
            return this._opcionesDelDominio.asObservable();
        }
    
        get opcionPadre$(): Observable<OpcionModel> {
            return this._opcionPadre.asObservable();
        }*/

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
    getTimbrados(page: number = 0, size: number = 10, sort: string = 'id', order: 'asc' | 'desc' | '' = 'asc', search: string = ''):
        Observable<any> {
        const headers = { 'Authorization': 'Bearer ' + this._authService.accessToken }
        //console.log('token: ' + this._authService.accessToken);
        return this._httpClient.get<any>(AuthUtils.MUNISYS_BACKEND_URL + "/timbrados/paginado", {
            params: {
                page: '' + page,
                size: '' + size,
                sort,
                order,
                search,
            }, headers
        })
            .pipe(tap((response) => {
                console.log(response.data);
                this._pagination.next(response.pagination);
                this._timbrados.next(response.data);
            }),
            );
    }


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
    getTimbradoById(id: string): Observable<TimbradoModel> {
        return this._httpClient.get<TimbradoModel>(AuthUtils.MUNISYS_BACKEND_URL + "/timbrados/" + id)
            .pipe(tap((timbrado) => {
                this._timbrado.next(timbrado);
            }),
            );
    }

    /**
     * Crear registro
     */
    createTimbrado(): Observable<TimbradoModel> {
        const newTimbrado: TimbradoModel = {
            id: '',
            nroTimbrado: null,
            cantidad: null,
            tipoComprobante: null,
            factHasta: '',
            factDesde: '',
            fechaInicio: '',
            fechaVencimiento: '',
            estado: null,
            nroEstablecimiento: '',
            puntoExpedicion:''
        };

        return this.timbrados$.pipe(
            take(1),
            map(timbrados => {
                // Agregar el nuevo timbrado a la lista
                this._timbrados.next([newTimbrado, ...timbrados]);

                // Devolver el nuevo timbrado
                return newTimbrado;
            })
        );
    }

    getFirstTimbrado():any{
        return this.timbrados$.pipe(first());
    }

    /**
     * Update product
     *
     * @param id
     * @param registro
     */
    updateTimbrado(id: string, timbrado: TimbradoModel): Observable<TimbradoModel> {
        const headers = { 'Authorization': 'Bearer ' + this._authService.accessToken }
        //console.log("token_update: " + headers.Authorization);
        console.log(timbrado);
        return this.timbrados$.pipe(
            take(1),
            switchMap(timbrados => this._httpClient.put<TimbradoModel>(AuthUtils.MUNISYS_BACKEND_URL + "/timbrados", timbrado, { headers })
                .pipe(
                    map((updatedTimbrado) => {
                        // Find the index of the updated product
                        const index = timbrados.findIndex(item => item.id === id);

                        // Update the product
                        timbrados[index] = updatedTimbrado;

                        // Update the products
                        this._timbrados.next(timbrados);

                        // Return the updated product
                        return updatedTimbrado;
                    }),
                    switchMap(updatedTimbrado => this.timbrado$.pipe(
                        take(1),
                        filter(item => item && item.id === id),
                        tap(() => {
                            // Update the product if it's selected
                            this._timbrado.next(updatedTimbrado);

                            // Return the updated product
                            return updatedTimbrado;
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
