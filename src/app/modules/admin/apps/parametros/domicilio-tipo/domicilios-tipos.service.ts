import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { BehaviorSubject, filter, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { AuthService } from 'app/core/auth/auth.service';
import { DomicilioTipoModel } from './domicilios-tipos.types';
import { GenericPagination } from '../domicilio-tipo/domicilios-tipos.types';

@Injectable({ providedIn: 'root' })
export class DomicilioTipoService {
    //x: string]: any;
    // Private
    private _domiciliosTipos: BehaviorSubject<DomicilioTipoModel[] | null> = new BehaviorSubject(null);
    private _domicilioTipo: BehaviorSubject<DomicilioTipoModel | null> = new BehaviorSubject(null);
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

    get domiciliosTipos$(): Observable<DomicilioTipoModel[]> {
        return this._domiciliosTipos.asObservable();
    }

    get domicilioTipo$(): Observable<DomicilioTipoModel> {
        return this._domicilioTipo.asObservable();
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
    getDomiciliosTipos(page: number = 0, size: number = 10, sort: string = 'descripcion', order: 'asc' | 'desc' | '' = 'asc', search: string = ''):
        Observable<any> {
        const headers = { 'Authorization': 'Bearer ' + this._authService.accessToken }
        return this._httpClient.get<any>(AuthUtils.MUNISYS_BACKEND_URL + "/domicilios-tipos/paginado", {
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
                this._domiciliosTipos.next(response);
            }),
            );
    }




    /**
     * Get personaContribuyente by id
     */
    getDomicilioTipoById(id: string): Observable<DomicilioTipoModel> {
        return this._httpClient.get<DomicilioTipoModel>(AuthUtils.MUNISYS_BACKEND_URL + "/domicilios-tipos/" + id)
            .pipe(tap((domicilioTipo) => {
                this._domicilioTipo.next(domicilioTipo);
            }),
            );
    }

   

    /**
     * Crear producto
     */
    crearPersonaContribuyente(): Observable<DomicilioTipoModel> {
        const newDomicilioTipo: DomicilioTipoModel = {
            id: '0',
            descripcion: '',
            fechaAlta: '',
            fechaModificacion: '',
            usuarioAlta: null,
            usuarioModificacion: null,
        };

        return this.domiciliosTipos$.pipe(
            take(1),
            map(lista => {
                this._domiciliosTipos.next([newDomicilioTipo, ...lista]);
                return newDomicilioTipo;
            })
        );
    }

    /**
     * Update product
     *
     * @param id
     * @param product
     */
            updateDomicilioTipo(id: string, domicilioTipo: DomicilioTipoModel): Observable<DomicilioTipoModel> {
                return this.domiciliosTipos$.pipe(
                    take(1),
                    switchMap(domiciliosTipos =>
                        this._httpClient.put<DomicilioTipoModel>(AuthUtils.MUNISYS_BACKEND_URL + "/domicilios-tipos", domicilioTipo).pipe(
                            map((updatedDomicilioTipo) => {
                                const index = domiciliosTipos.findIndex(item => item.id === id);
                                domiciliosTipos[index] = updatedDomicilioTipo;
                                this._domiciliosTipos.next(domiciliosTipos);
                                return updatedDomicilioTipo;
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
 deleteDomicilioTipo(id: string): Observable<boolean> {
    const headers = { 'Authorization': 'Bearer ' + this._authService.accessToken };
    console.log("Deleting domicilio tipo with id: " + id);
    return this.domiciliosTipos$.pipe(
        take(1),
        switchMap(domicilioTipo => this._httpClient.delete(AuthUtils.MUNISYS_BACKEND_URL + "/domicilios-tipos/" + id).pipe(
            map(() => { // No necesitamos 'isDeleted' aquí si el backend no lo devuelve explícitamente y solo indica éxito por el 200 OK
                // Filtrar el tipo documento eliminado del array actual y emitir el nuevo array
                const updatedDomicilioTipo = domicilioTipo.filter(item => item.id !== id);
                this._domiciliosTipos.next([...updatedDomicilioTipo]); // Emitir una nueva referencia del array

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

    createDomicilioTipo(domicilioTipo: Partial<DomicilioTipoModel>): Observable<DomicilioTipoModel> {
    return this._httpClient.post<DomicilioTipoModel>(AuthUtils.MUNISYS_BACKEND_URL + "/domicilios-tipos", domicilioTipo).pipe(
        tap((nuevo) => {
            this._domiciliosTipos.pipe(take(1)).subscribe(lista => {
                this._domiciliosTipos.next([nuevo, ...lista]);
            });
        })
    );
}


/**
 * Lista todos los personaContribuyentes sin paginación (para usar en selects)
 */
listarDomiciliosTipos(): Observable<DomicilioTipoModel[]> {
    const headers = {
        'Authorization': 'Bearer ' + this._authService.accessToken
    };
    return this._httpClient.get<DomicilioTipoModel[]>(AuthUtils.MUNISYS_BACKEND_URL + '/domicilios-tipos', { headers }).pipe(
        tap((domiciliosTipos) => {
            this._domiciliosTipos.next(domiciliosTipos);
        })
    );
}



 
}
