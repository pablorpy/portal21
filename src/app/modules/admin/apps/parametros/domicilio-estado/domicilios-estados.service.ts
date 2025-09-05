import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { BehaviorSubject, filter, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { AuthService } from 'app/core/auth/auth.service';
import { DomicilioEstadoModel } from './domicilios-estados.types';
import { GenericPagination } from '../domicilio-estado/domicilios-estados.types';

@Injectable({ providedIn: 'root' })
export class DomicilioEstadoService {

    private _domiciliosEstados: BehaviorSubject<DomicilioEstadoModel[] | null> = new BehaviorSubject(null);
    private _domicilioEstado: BehaviorSubject<DomicilioEstadoModel | null> = new BehaviorSubject(null);
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

    get domiciliosEstados$(): Observable<DomicilioEstadoModel[]> {
        return this._domiciliosEstados.asObservable();
    }

    get domicilioEstado$(): Observable<DomicilioEstadoModel> {
        return this._domicilioEstado.asObservable();
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
    getDomiciliosEstados(page: number = 0, size: number = 10, sort: string = 'descripcion', order: 'asc' | 'desc' | '' = 'asc', search: string = ''):
        Observable<any> {
        const headers = { 'Authorization': 'Bearer ' + this._authService.accessToken }
        return this._httpClient.get<any>(AuthUtils.MUNISYS_BACKEND_URL + "/domicilios-estados/paginado", {
            params: {
                page: '' + page,
                size: '' + size,
                sort,
                order,
                search,
            }, headers
        })
            .pipe(tap((response) => {
            //  this._pagination.next(response);
                this._domiciliosEstados.next(response);
            }),
            );
    }




    /**
     * Get personaContribuyente by id
     */
    getDomicilioEstadoById(id: string): Observable<DomicilioEstadoModel> {
        return this._httpClient.get<DomicilioEstadoModel>(AuthUtils.MUNISYS_BACKEND_URL + "/domicilios-estados/" + id)
            .pipe(tap((domicilioEstado) => {
                this._domicilioEstado.next(domicilioEstado);
            }),
            );
    }

   

    /**
     * Crear producto
     */
    crearPersonaContribuyente(): Observable<DomicilioEstadoModel> {
        const newPersonasContribuyente: DomicilioEstadoModel = {
            id: '0',
            descripcion: '',
            fechaAlta: '',
            fechaModificacion: '',
            usuarioAlta: null,
            usuarioModificacion: null,
        };

        return this.domiciliosEstados$.pipe(
            take(1),
            map(lista => {
                this._domiciliosEstados.next([newPersonasContribuyente, ...lista]);
                return newPersonasContribuyente;
            })
        );
    }

    /**
     * Update product
     *
     * @param id
     * @param product
     */
            updateDomicilioEstado(id: string, domicilioEstado: DomicilioEstadoModel): Observable<DomicilioEstadoModel> {
                return this.domiciliosEstados$.pipe(
                    take(1),
                    switchMap(domiciliosEstados =>
                        this._httpClient.put<DomicilioEstadoModel>(AuthUtils.MUNISYS_BACKEND_URL + "/domicilios-estados", domicilioEstado).pipe(
                            map((updatedDomicilioEstado) => {
                                const index = domiciliosEstados.findIndex(item => item.id === id);
                                domiciliosEstados[index] = updatedDomicilioEstado;
                                this._domiciliosEstados.next(domiciliosEstados);
                                return updatedDomicilioEstado;
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
 deleteDomicilioEstado(id: string): Observable<boolean> {
    const headers = { 'Authorization': 'Bearer ' + this._authService.accessToken };
    console.log("Deleting domicilioestado with id: " + id);
    return this.domiciliosEstados$.pipe(
        take(1),
        switchMap(domicilioEstado  => this._httpClient.delete(AuthUtils.MUNISYS_BACKEND_URL + "/domicilios-estados/" + id).pipe(
            map(() => { // No necesitamos 'isDeleted' aquí si el backend no lo devuelve explícitamente y solo indica éxito por el 200 OK
                // Filtrar el dimicilio estado eliminado del array actual y emitir el nuevo array
                const updatedDomiciliosEstados = domicilioEstado.filter(item => item.id !== id);
                this._domiciliosEstados.next([...updatedDomiciliosEstados]); // Emitir una nueva referencia del array

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

    createDomicilioEstado(domicilioEstado: Partial<DomicilioEstadoModel>): Observable<DomicilioEstadoModel> {
    return this._httpClient.post<DomicilioEstadoModel>(AuthUtils.MUNISYS_BACKEND_URL + "/domicilios-estados", domicilioEstado).pipe(
        tap((nuevo) => {
            this._domiciliosEstados.pipe(take(1)).subscribe(lista => {
                this._domiciliosEstados.next([nuevo, ...lista]);
            });
        })
    );
}




/**
 * Lista todos los personaContribuyentes sin paginación (para usar en selects)
 */
listarDomiciliosEstados(): Observable<DomicilioEstadoModel[]> {
    const headers = {
        'Authorization': 'Bearer ' + this._authService.accessToken
    };
    return this._httpClient.get<DomicilioEstadoModel[]>(AuthUtils.MUNISYS_BACKEND_URL + '/domicilios-estados', { headers }).pipe(
        tap((domiciliosEstados) => {
            this._domiciliosEstados.next(domiciliosEstados);
        })
    );
}

}
