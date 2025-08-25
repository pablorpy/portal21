import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { BehaviorSubject, filter, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { AuthService } from 'app/core/auth/auth.service';
import { DomicilioCategoriaModel } from './domicilios-categorias.types';
import { GenericPagination } from '../domicilio-categoria/domicilios-categorias.types';

@Injectable({ providedIn: 'root' })
export class DomicilioCategoriaService {
    //x: string]: any;
    // Private
    private _domiciliosCategorias: BehaviorSubject<DomicilioCategoriaModel[] | null> = new BehaviorSubject(null);
    private _domicilioCategoria: BehaviorSubject<DomicilioCategoriaModel | null> = new BehaviorSubject(null);
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

    get domiciliosCategorias$(): Observable<DomicilioCategoriaModel[]> {
        return this._domiciliosCategorias.asObservable();
    }

    get domicilioCategoria$(): Observable<DomicilioCategoriaModel> {
        return this._domicilioCategoria.asObservable();
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
    getDomiciliosCategorias(page: number = 0, size: number = 10, sort: string = 'descripcion', order: 'asc' | 'desc' | '' = 'asc', search: string = ''):
        Observable<any> {
        const headers = { 'Authorization': 'Bearer ' + this._authService.accessToken }
        return this._httpClient.get<any>(AuthUtils.MUNISYS_BACKEND_URL + "/domicilios-categorias/paginado", {
            params: {
                page: '' + page,
                size: '' + size,
                sort,
                order,
                search,
            }, headers
        })
            .pipe(tap((response) => {
                //this._pagination.next(response);
                this._domiciliosCategorias.next(response);
            }),
            );
    }




    /**
     * Get domicilioCategoria by id
     */
    getDomicilioCategoriaById(id: string): Observable<DomicilioCategoriaModel> {
        return this._httpClient.get<DomicilioCategoriaModel>(AuthUtils.MUNISYS_BACKEND_URL + "/domicilios-categorias/" + id)
            .pipe(tap((domicilioCategoria) => {
                this._domicilioCategoria.next(domicilioCategoria);
            }),
            );
    }

   

    /**
     * Crear producto
     */
    crearDomicilioCategoria(): Observable<DomicilioCategoriaModel> {
        const newDomicilioCategoria: DomicilioCategoriaModel = {
            id: '0',
            descripcion: '',
            fechaAlta: '',
            fechaModificacion: '',
            usuarioAlta: null,
            usuarioModificacion: null,
        };

        return this.domiciliosCategorias$.pipe(
            take(1),
            map(lista => {
                this._domiciliosCategorias.next([newDomicilioCategoria, ...lista]);
                return newDomicilioCategoria;
            })
        );
    }

    /**
     * Update product
     *
     * @param id
     * @param product
     */
            updateDomicilioCategoria(id: string, domicilioCategoria: DomicilioCategoriaModel): Observable<DomicilioCategoriaModel> {
                return this.domiciliosCategorias$.pipe(
                    take(1),
                    switchMap(domiciliosCategorias =>
                        this._httpClient.put<DomicilioCategoriaModel>(AuthUtils.MUNISYS_BACKEND_URL + "/domicilios-categorias", domicilioCategoria).pipe(
                            map((updatedDomicilioCategoria) => {
                                const index = domiciliosCategorias.findIndex(item => item.id === id);
                                domiciliosCategorias[index] = updatedDomicilioCategoria;
                                this._domiciliosCategorias.next(domiciliosCategorias);
                                return updatedDomicilioCategoria;
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
 deleteDomicilioCategoria(id: string): Observable<boolean> {
    const headers = { 'Authorization': 'Bearer ' + this._authService.accessToken };
    console.log("Deleting domicilio categoria with id: " + id);
    return this.domiciliosCategorias$.pipe(
        take(1),
        switchMap(domicilioCategoria => this._httpClient.delete(AuthUtils.MUNISYS_BACKEND_URL + "/domicilios-categorias/" + id).pipe(
            map(() => { // No necesitamos 'isDeleted' aquí si el backend no lo devuelve explícitamente y solo indica éxito por el 200 OK
                // Filtrar el domicilio categoria eliminado del array actual y emitir el nuevo array
                const updatedDomiciliosCategorias = domicilioCategoria.filter(item => item.id !== id);
                this._domiciliosCategorias.next([...updatedDomiciliosCategorias]); // Emitir una nueva referencia del array

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

    createDomicilioCategoria(domicilioCategoria: Partial<DomicilioCategoriaModel>): Observable<DomicilioCategoriaModel> {
    return this._httpClient.post<DomicilioCategoriaModel>(AuthUtils.MUNISYS_BACKEND_URL + "/domicilios-categorias", domicilioCategoria).pipe(
        tap((nuevo) => {
            this._domiciliosCategorias.pipe(take(1)).subscribe(lista => {
                this._domiciliosCategorias.next([nuevo, ...lista]);
            });
        })
    );
}


/**
 * Lista todos los domicilios categorias sin paginación (para usar en selects)
 */
listarDomicilioCategoria(): Observable<DomicilioCategoriaModel[]> {
    const headers = {
        'Authorization': 'Bearer ' + this._authService.accessToken
    };
    return this._httpClient.get<DomicilioCategoriaModel[]>(AuthUtils.MUNISYS_BACKEND_URL + '/domicilios-categorias', { headers }).pipe(
        tap((domiciliosCategorias) => {
            this._domiciliosCategorias.next(domiciliosCategorias);
        })
    );
}
 
}
