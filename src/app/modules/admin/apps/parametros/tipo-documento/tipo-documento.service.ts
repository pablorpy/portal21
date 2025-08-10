import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { BehaviorSubject, filter, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { AuthService } from 'app/core/auth/auth.service';
import { TipoDocumentoModel, GenericPagination } from './tipo-documentos.types';

@Injectable({ providedIn: 'root' })
export class TipoDocumentoService {
    //x: string]: any;
    // Private
    private _tipoDocumentos: BehaviorSubject<TipoDocumentoModel[] | null> = new BehaviorSubject(null);
    private _tipoDocumento: BehaviorSubject<TipoDocumentoModel | null> = new BehaviorSubject(null);
    private _pagination: BehaviorSubject<GenericPagination | null> = new BehaviorSubject(null);
    private _authService = inject(AuthService);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    get tipoDocumentos$(): Observable<TipoDocumentoModel[]> {
        return this._tipoDocumentos.asObservable();
    }

    get tipoDocumento$(): Observable<TipoDocumentoModel> {
        return this._tipoDocumento.asObservable();
    }

    get pagination$(): Observable<GenericPagination> {
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
    getTipoDocumentos(page: number = 0, size: number = 10, sort: string = 'nombre', order: 'asc' | 'desc' | '' = 'asc', search: string = ''):
        Observable<any> {
        const headers = { 'Authorization': 'Bearer ' + this._authService.accessToken }
        return this._httpClient.get<any>(AuthUtils.MUNISYS_BACKEND_URL + "/tipoDocumentos/paginado", {
            params: {
                page: '' + page,
                size: '' + size,
                sort,
                order,
                search,
            }, headers
        })
            .pipe(tap((response) => {
                this._pagination.next(response.pagination);
                this._tipoDocumentos.next(response.data);
            }),
            );
    }




    /**
     * Get TipoDocumento by id
     */
    getTipoDocmentoById(id: string): Observable<TipoDocumentoModel> {
        return this._httpClient.get<TipoDocumentoModel>(AuthUtils.MUNISYS_BACKEND_URL + "/tipoDocumentos/" + id)
            .pipe(tap((tipoDocumento) => {
                this._tipoDocumento.next(tipoDocumento);
            }),
            );
    }

   

    /**
     * Crear producto
     */
    crearTipoDocumento(): Observable<TipoDocumentoModel> {
        const newTipoDocumento: TipoDocumentoModel = {
            id: '0',
            nombre: '',
            fechaAlta: '',
            fechaModificacion: '',
            usuarioAlta: null,
            usuarioModificacion: null,
        };

        return this.tipoDocumentos$.pipe(
            take(1),
            map(tipoDocumentos => {
                this._tipoDocumentos.next([newTipoDocumento, ...tipoDocumentos]);
                return newTipoDocumento;
            })
        );
    }

    /**
     * Update product
     *
     * @param id
     * @param product
     */
            updateTipoDocumento(id: string, tipoDocumento: TipoDocumentoModel): Observable<TipoDocumentoModel> {
                return this.tipoDocumentos$.pipe(
                    take(1),
                    switchMap(tipoDocumentos =>
                        this._httpClient.put<TipoDocumentoModel>(AuthUtils.MUNISYS_BACKEND_URL + "/tipoDocumentos", tipoDocumento).pipe(
                            map((updatedTipoDocumento) => {
                                const index = tipoDocumentos.findIndex(item => item.id === id);
                                tipoDocumentos[index] = updatedTipoDocumento;
                                this._tipoDocumentos.next(tipoDocumentos);
                                return updatedTipoDocumento;
                            })
                        )
                    )
                );
            }



    /**
     * Delete the product
     *
     * @param id
     */
 deleteTipoDocumento(id: string): Observable<boolean> {
    const headers = { 'Authorization': 'Bearer ' + this._authService.accessToken };
    console.log("Deleting tipo documento with id: " + id);
    return this.tipoDocumentos$.pipe(
        take(1),
        switchMap(tipoDocumento => this._httpClient.delete(AuthUtils.MUNISYS_BACKEND_URL + "/tipoDocumentos/" + id).pipe(
            map(() => { // No necesitamos 'isDeleted' aquí si el backend no lo devuelve explícitamente y solo indica éxito por el 200 OK
                // Filtrar el tipo documento eliminado del array actual y emitir el nuevo array
                const updatedTipoDocumentos = tipoDocumento.filter(item => item.id !== id);
                this._tipoDocumentos.next([...updatedTipoDocumentos]); // Emitir una nueva referencia del array

                // Si tu backend devuelve un booleano, puedes mantener 'isDeleted'
                // Para este ejemplo, asumimos que un 200 OK significa éxito
                return true; // Indicamos éxito
            }),
            // Manejo de errores opcional si el backend devuelve un error en la eliminación
            // catchError(error => {
            //     console.error('Error al eliminar el tipo documento:', error);
            //     return throwError(() => new Error('Error al eliminar el tipo documento'));
            // })
        )),
    );
}

    createTipoDocumento(tipoDocumento: Partial<TipoDocumentoModel>): Observable<TipoDocumentoModel> {
    return this._httpClient.post<TipoDocumentoModel>(AuthUtils.MUNISYS_BACKEND_URL + "/tipoDocumentos", tipoDocumento).pipe(
        tap((nuevo) => {
            this._tipoDocumentos.pipe(take(1)).subscribe(tipoDocumentos => {
                this._tipoDocumentos.next([nuevo, ...tipoDocumentos]);
            });
        })
    );
}


/**
 * Lista todos los tipoDocumentos sin paginación (para usar en selects)
 */
listarTipoDocuentos(): Observable<TipoDocumentoModel[]> {
    const headers = {
        'Authorization': 'Bearer ' + this._authService.accessToken
    };
    return this._httpClient.get<TipoDocumentoModel[]>(AuthUtils.MUNISYS_BACKEND_URL + '/tipoDocumentos', { headers }).pipe(
        tap((tipoDocumentos) => {
            this._tipoDocumentos.next(tipoDocumentos);
        })
    );
}



 
}
