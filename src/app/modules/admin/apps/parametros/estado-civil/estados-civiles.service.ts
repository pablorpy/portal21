import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { BehaviorSubject, filter, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { AuthService } from 'app/core/auth/auth.service';
import { EstadoCivilModel } from './estados-civiles.types';
import { GenericPagination } from '../estado-civil/estados-civiles.types';

@Injectable({ providedIn: 'root' })
export class EstadoCivilService {
    //x: string]: any;
    // Private
    private _estadosCiviles: BehaviorSubject<EstadoCivilModel[] | null> = new BehaviorSubject(null);
    private _estadoCivil: BehaviorSubject<EstadoCivilModel | null> = new BehaviorSubject(null);
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

    get estadosCiviles$(): Observable<EstadoCivilModel[]> {
        return this._estadosCiviles.asObservable();
    }

    get estadoCivil$(): Observable<EstadoCivilModel> {
        return this._estadoCivil.asObservable();
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
    getestadosCiviles(page: number = 0, size: number = 10, sort: string = 'descripcion', order: 'asc' | 'desc' | '' = 'asc', search: string = ''):
        Observable<any> {
        const headers = { 'Authorization': 'Bearer ' + this._authService.accessToken }
        return this._httpClient.get<any>(AuthUtils.MUNISYS_BACKEND_URL + "/estados-civiles/paginado", {
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
                this._estadosCiviles.next(response);
            }),
            );
    }




    /**
     * Get estadoCivil by id
     */
    getEstadoCivilById(id: string): Observable<EstadoCivilModel> {
        return this._httpClient.get<EstadoCivilModel>(AuthUtils.MUNISYS_BACKEND_URL + "/estados-civiles/" + id)
            .pipe(tap((estadoCivil) => {
                this._estadoCivil.next(estadoCivil);
            }),
            );
    }

   

    /**
     * Crear producto
     */
    crearEstadoCivil(): Observable<EstadoCivilModel> {
        const newEstadoCivil: EstadoCivilModel = {
            id: '0',
            descripcion: '',
            fechaAlta: '',
            fechaModificacion: '',
            usuarioAlta: null,
            usuarioModificacion: null,
        };

        return this.estadosCiviles$.pipe(
            take(1),
            map(lista => {
                this._estadosCiviles.next([newEstadoCivil, ...lista]);
                return newEstadoCivil;
            })
        );
    }

    /**
     * Update product
     *
     * @param id
     * @param product
     */
            updateEstadoCivil(id: string, estadoCivil: EstadoCivilModel): Observable<EstadoCivilModel> {
                return this.estadosCiviles$.pipe(
                    take(1),
                    switchMap(estadosCiviles =>
                        this._httpClient.put<EstadoCivilModel>(AuthUtils.MUNISYS_BACKEND_URL + "/estados-civiles", estadoCivil).pipe(
                            map((updatedEstadoCivil) => {
                                const index = estadosCiviles.findIndex(item => item.id === id);
                                estadosCiviles[index] = updatedEstadoCivil;
                                this._estadosCiviles.next(estadosCiviles);
                                return updatedEstadoCivil;
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
 deleteEstadoCivil(id: string): Observable<boolean> {
    const headers = { 'Authorization': 'Bearer ' + this._authService.accessToken };
    console.log("Deleting estado civil with id: " + id);
    return this.estadosCiviles$.pipe(
        take(1),
        switchMap(estadoCivil => this._httpClient.delete(AuthUtils.MUNISYS_BACKEND_URL + "/estados-civiles/" + id).pipe(
            map(() => { // No necesitamos 'isDeleted' aquí si el backend no lo devuelve explícitamente y solo indica éxito por el 200 OK
                // Filtrar el estado civil eliminado del array actual y emitir el nuevo array
                const updatedEstadosCiviles = estadoCivil.filter(item => item.id !== id);
                this._estadosCiviles.next([...updatedEstadosCiviles]); // Emitir una nueva referencia del array

                // Si tu backend devuelve un booleano, puedes mantener 'isDeleted'
                // Para este ejemplo, asumimos que un 200 OK significa éxito
                return true; // Indicamos éxito
            }),
            // Manejo de errores opcional si el backend devuelve un error en la eliminación
            // catchError(error => {
            //     console.error('Error al eliminar el estado civil:', error);
            //     return throwError(() => new Error('Error al eliminar el estado civil'));
            // })
        )),
    );
}

    createEstadoCivil(estadoCivil: Partial<EstadoCivilModel>): Observable<EstadoCivilModel> {
    return this._httpClient.post<EstadoCivilModel>(AuthUtils.MUNISYS_BACKEND_URL + "/estados-civiles", estadoCivil).pipe(
        tap((nuevo) => {
            this._estadosCiviles.pipe(take(1)).subscribe(lista => {
                this._estadosCiviles.next([nuevo, ...lista]);
            });
        })
    );
}


/**
 * Lista todos los estadosCiviles sin paginación (para usar en selects)
 */
listarEstadoCivil(): Observable<EstadoCivilModel[]> {
    const headers = {
        'Authorization': 'Bearer ' + this._authService.accessToken
    };
    return this._httpClient.get<EstadoCivilModel[]>(AuthUtils.MUNISYS_BACKEND_URL + '/estados-civiles', { headers }).pipe(
        tap((estadosCiviles) => {
            this._estadosCiviles.next(estadosCiviles);
        })
    );
}



 
}
