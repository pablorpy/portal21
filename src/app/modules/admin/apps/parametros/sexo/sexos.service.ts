import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { BehaviorSubject, filter, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { AuthService } from 'app/core/auth/auth.service';
import { SexoModel } from './sexos.types';
import { GenericPagination } from './sexos.types';

@Injectable({ providedIn: 'root' })
export class SexoService {
    //x: string]: any;
    // Private
    private _sexos: BehaviorSubject<SexoModel[] | null> = new BehaviorSubject(null);
    private _sexo: BehaviorSubject<SexoModel | null> = new BehaviorSubject(null);
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

    get sexos$(): Observable<SexoModel[]> {
        return this._sexos.asObservable();
    }

    get sexo$(): Observable<SexoModel> {
        return this._sexo.asObservable();
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
    getSexos(page: number = 0, size: number = 10, sort: string = 'descripcion', order: 'asc' | 'desc' | '' = 'asc', search: string = ''):
        Observable<any> {
        const headers = { 'Authorization': 'Bearer ' + this._authService.accessToken }
        return this._httpClient.get<any>(AuthUtils.MUNISYS_BACKEND_URL + "/sexos/paginado", {
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
                this._sexos.next(response);
            }),
            );
    }




    /**
     * Get sexo by id
     */
    getSexoById(id: string): Observable<SexoModel> {
        return this._httpClient.get<SexoModel>(AuthUtils.MUNISYS_BACKEND_URL + "/sexos/" + id)
            .pipe(tap((sexo) => {
                this._sexo.next(sexo);
            }),
            );
    }

   

    /**
     * Crear producto
     */
    crearSexo(): Observable<SexoModel> {
        const newSexo: SexoModel = {
            id: '0',
            descripcion: '',
            fechaAlta: '',
            fechaModificacion: '',
            usuarioAlta: null,
            usuarioModificacion: null,
        };

        return this.sexos$.pipe(
            take(1),
            map(lista => {
                this._sexos.next([newSexo, ...lista]);
                return newSexo;
            })
        );
    }

    /**
     * Update product
     *
     * @param id
     * @param product
     */
            updateSexo(id: string, sexo: SexoModel): Observable<SexoModel> {
                return this.sexos$.pipe(
                    take(1),
                    switchMap(sexos =>
                        this._httpClient.put<SexoModel>(AuthUtils.MUNISYS_BACKEND_URL + "/sexos", sexo).pipe(
                            map((updateSexo) => {
                                const index = sexos.findIndex(item => item.id === id);
                                sexos[index] = updateSexo;
                                this._sexos.next(sexos);
                                return updateSexo;
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
 deleteSexo(id: string): Observable<boolean> {
    const headers = { 'Authorization': 'Bearer ' + this._authService.accessToken };
    console.log("Deleting sexo with id: " + id);
    return this.sexos$.pipe(
        take(1),
        switchMap(sexo => this._httpClient.delete(AuthUtils.MUNISYS_BACKEND_URL + "/sexos/" + id).pipe(
            map(() => { // No necesitamos 'isDeleted' aquí si el backend no lo devuelve explícitamente y solo indica éxito por el 200 OK
                // Filtrar el sexo eliminado del array actual y emitir el nuevo array
                const updatesexos = sexo.filter(item => item.id !== id);
                this._sexos.next([...updatesexos]); // Emitir una nueva referencia del array

                // Si tu backend devuelve un booleano, puedes mantener 'isDeleted'
                // Para este ejemplo, asumimos que un 200 OK significa éxito
                return true; // Indicamos éxito
            }),
            // Manejo de errores opcional si el backend devuelve un error en la eliminación
            // catchError(error => {
            //     console.error('Error al eliminar el sexo:', error);
            //     return throwError(() => new Error('Error al eliminar el sexo'));
            // })
        )),
    );
}

    createSexo(sexo: Partial<SexoModel>): Observable<SexoModel> {
    return this._httpClient.post<SexoModel>(AuthUtils.MUNISYS_BACKEND_URL + "/sexos", sexo).pipe(
        tap((nuevo) => {
            this._sexos.pipe(take(1)).subscribe(lista => {
                this._sexos.next([nuevo, ...lista]);
            });
        })
    );
}


/**
 * Lista todos los sexos sin paginación (para usar en selects)
 */
listarSexos(): Observable<SexoModel[]> {
    const headers = {
        'Authorization': 'Bearer ' + this._authService.accessToken
    };
    return this._httpClient.get<SexoModel[]>(AuthUtils.MUNISYS_BACKEND_URL + '/sexos', { headers }).pipe(
        tap((sexos) => {
            this._sexos.next(sexos);
        })
    );
}



 
}
