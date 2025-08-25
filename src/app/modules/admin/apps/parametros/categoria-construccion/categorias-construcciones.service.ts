import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { BehaviorSubject, filter, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { AuthService } from 'app/core/auth/auth.service';
import { CategoriaConstruccionModel } from './categorias-construcciones.types';
import { GenericPagination } from '../categoria-construccion/categorias-construcciones.types';

@Injectable({ providedIn: 'root' })
export class CategoriaConstruccionService {
    //x: string]: any;
    // Private
    private _categoriasConstrucciones: BehaviorSubject<CategoriaConstruccionModel[] | null> = new BehaviorSubject(null);
    private _categoriasConstruccion: BehaviorSubject<CategoriaConstruccionModel | null> = new BehaviorSubject(null);
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

    get categoriasConstrucciones$(): Observable<CategoriaConstruccionModel[]> {
        return this._categoriasConstrucciones.asObservable();
    }

    get categoriaConstruccion$(): Observable<CategoriaConstruccionModel> {
        return this._categoriasConstruccion.asObservable();
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
    getCategoriasConstrucciones(page: number = 0, size: number = 10, sort: string = 'descripcion', order: 'asc' | 'desc' | '' = 'asc', search: string = ''):
        Observable<any> {
        const headers = { 'Authorization': 'Bearer ' + this._authService.accessToken }
        return this._httpClient.get<any>(AuthUtils.MUNISYS_BACKEND_URL + "/categorias-construcciones/paginado", {
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
                this._categoriasConstrucciones.next(response);
            }),
            );
    }




    /**
     * Get categoriaConstruccion by id
     */
    getTipoDocmentoById(id: string): Observable<CategoriaConstruccionModel> {
        return this._httpClient.get<CategoriaConstruccionModel>(AuthUtils.MUNISYS_BACKEND_URL + "/categorias-construcciones/" + id)
            .pipe(tap((categoriaConstruccion) => {
                this._categoriasConstruccion.next(categoriaConstruccion);
            }),
            );
    }

   

    /**
     * Crear producto
     */
    crearCategoriaConstruccion(): Observable<CategoriaConstruccionModel> {
        const newCategoriasConstrucciones: CategoriaConstruccionModel = {
            id: '0',
            descripcion: '',
            fechaAlta: '',
            fechaModificacion: '',
            usuarioAlta: null,
            usuarioModificacion: null,
        };

        return this.categoriasConstrucciones$.pipe(
            take(1),
            map(lista => {
                this._categoriasConstrucciones.next([newCategoriasConstrucciones, ...lista]);
                return newCategoriasConstrucciones;
            })
        );
    }

    /**
     * Update product
     *
     * @param id
     * @param product
     */
            updateCategoriasConstrucciones(id: string, categoriaConstruccion: CategoriaConstruccionModel): Observable<CategoriaConstruccionModel> {
                return this.categoriasConstrucciones$.pipe(
                    take(1),
                    switchMap(categoriasConstrucciones =>
                        this._httpClient.put<CategoriaConstruccionModel>(AuthUtils.MUNISYS_BACKEND_URL + "/categorias-construcciones", categoriaConstruccion).pipe(
                            map((updatedCategoriaConstruccion) => {
                                const index = categoriasConstrucciones.findIndex(item => item.id === id);
                                categoriasConstrucciones[index] = updatedCategoriaConstruccion;
                                this._categoriasConstrucciones.next(categoriasConstrucciones);
                                return updatedCategoriaConstruccion;
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
 deleteCategoriasConstrucciones(id: string): Observable<boolean> {
    const headers = { 'Authorization': 'Bearer ' + this._authService.accessToken };
    console.log("Deleting tipo documento with id: " + id);
    return this.categoriasConstrucciones$.pipe(
        take(1),
        switchMap(categoriaConstruccion => this._httpClient.delete(AuthUtils.MUNISYS_BACKEND_URL + "/categorias-construcciones/" + id).pipe(
            map(() => { // No necesitamos 'isDeleted' aquí si el backend no lo devuelve explícitamente y solo indica éxito por el 200 OK
                // Filtrar el tipo documento eliminado del array actual y emitir el nuevo array
                const updatedCategoriasConstrucciones = categoriaConstruccion.filter(item => item.id !== id);
                this._categoriasConstrucciones.next([...updatedCategoriasConstrucciones]); // Emitir una nueva referencia del array

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

    createCategoriasConstrucciones(categoriaConstruccion: Partial<CategoriaConstruccionModel>): Observable<CategoriaConstruccionModel> {
    return this._httpClient.post<CategoriaConstruccionModel>(AuthUtils.MUNISYS_BACKEND_URL + "/categorias-construcciones", categoriaConstruccion).pipe(
        tap((nuevo) => {
            this._categoriasConstrucciones.pipe(take(1)).subscribe(lista => {
                this._categoriasConstrucciones.next([nuevo, ...lista]);
            });
        })
    );
}


/**
 * Lista todos los categoriaConstruccions sin paginación (para usar en selects)
 */
listarTipoDocuentos(): Observable<CategoriaConstruccionModel[]> {
    const headers = {
        'Authorization': 'Bearer ' + this._authService.accessToken
    };
    return this._httpClient.get<CategoriaConstruccionModel[]>(AuthUtils.MUNISYS_BACKEND_URL + '/categorias-construcciones', { headers }).pipe(
        tap((categoriasConstrucciones) => {
            this._categoriasConstrucciones.next(categoriasConstrucciones);
        })
    );
}



 
}
