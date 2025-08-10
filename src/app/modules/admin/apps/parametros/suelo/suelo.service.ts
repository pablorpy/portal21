import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { BehaviorSubject, filter, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { AuthService } from 'app/core/auth/auth.service';
import { SueloModel, GenericPagination } from './suelo.types';

@Injectable({ providedIn: 'root' })
export class SueloService {
    //x: string]: any;
    // Private
    private _suelos: BehaviorSubject<SueloModel[] | null> = new BehaviorSubject(null);
    private _suelo: BehaviorSubject<SueloModel | null> = new BehaviorSubject(null);
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

    get suelos$(): Observable<SueloModel[]> {
        return this._suelos.asObservable();
    }

    get suelo$(): Observable<SueloModel> {
        return this._suelo.asObservable();
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
    getSuelos(page: number = 0, size: number = 10, sort: string = 'nombre', order: 'asc' | 'desc' | '' = 'asc', search: string = ''):
        Observable<any> {
        const headers = { 'Authorization': 'Bearer ' + this._authService.accessToken }
        return this._httpClient.get<any>(AuthUtils.MUNISYS_BACKEND_URL + "/suelos/paginado", {
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
                this._suelos.next(response.data);
            }),
            );
    }




    /**
     * Get Suelo by id
     */
    getSueloById(id: string): Observable<SueloModel> {
        return this._httpClient.get<SueloModel>(AuthUtils.MUNISYS_BACKEND_URL + "/suelos/" + id)
            .pipe(tap((suelo) => {
                this._suelo.next(suelo);
            }),
            );
    }

   

    /**
     * Crear producto
     */
    crearSuelo(): Observable<SueloModel> {
        const newSuelo: SueloModel = {
            id: '0',
            nombre: '',
            fechaAlta: '',
            fechaModificacion: '',
            usuarioAlta: null,
            usuarioModificacion: null,
        };

        return this.suelos$.pipe(
            take(1),
            map(suelos => {
                this._suelos.next([newSuelo, ...suelos]);
                return newSuelo;
            })
        );
    }

    /**
     * Update product
     *
     * @param id
     * @param product
     */
            updateSuelo(id: string, suelo: SueloModel): Observable<SueloModel> {
                return this.suelos$.pipe(
                    take(1),
                    switchMap(suelos =>
                        this._httpClient.put<SueloModel>(AuthUtils.MUNISYS_BACKEND_URL + "/suelos", suelos).pipe(
                            map((updatedSuelo) => {
                                const index = suelos.findIndex(item => item.id === id);
                                suelos[index] = updatedSuelo;
                                this._suelos.next(suelos);
                                return updatedSuelo;
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
 deleteSuelo(id: string): Observable<boolean> {
    const headers = { 'Authorization': 'Bearer ' + this._authService.accessToken };
    console.log("Deleting suelo with id: " + id);
    return this.suelos$.pipe(
        take(1),
        switchMap(suelos => this._httpClient.delete(AuthUtils.MUNISYS_BACKEND_URL + "/suelos/" + id).pipe(
            map(() => { // No necesitamos 'isDeleted' aquí si el backend no lo devuelve explícitamente y solo indica éxito por el 200 OK
                // Filtrar el suelo eliminado del array actual y emitir el nuevo array
                const updatedSuelos = suelos.filter(item => item.id !== id);
                this._suelos.next([...updatedSuelos]); // Emitir una nueva referencia del array

                // Si tu backend devuelve un booleano, puedes mantener 'isDeleted'
                // Para este ejemplo, asumimos que un 200 OK significa éxito
                return true; // Indicamos éxito
            }),
            // Manejo de errores opcional si el backend devuelve un error en la eliminación
            // catchError(error => {
            //     console.error('Error al eliminar el suelo:', error);
            //     return throwError(() => new Error('Error al eliminar el suelo'));
            // })
        )),
    );
}

    createSuelo(suelo: Partial<SueloModel>): Observable<SueloModel> {
    return this._httpClient.post<SueloModel>(AuthUtils.MUNISYS_BACKEND_URL + "/suelos", suelo).pipe(
        tap((nuevo) => {
            this._suelos.pipe(take(1)).subscribe(suelos => {
                this._suelos.next([nuevo, ...suelos]);
            });
        })
    );
}


/**
 * Lista todos los suelos sin paginación (para usar en selects)
 */
listarSuelos(): Observable<SueloModel[]> {
    const headers = {
        'Authorization': 'Bearer ' + this._authService.accessToken
    };
    return this._httpClient.get<SueloModel[]>(AuthUtils.MUNISYS_BACKEND_URL + '/suelos', { headers }).pipe(
        tap((suelos) => {
            this._suelos.next(suelos);
        })
    );
}



 
}
