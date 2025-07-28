import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { BehaviorSubject, filter, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { AuthService } from 'app/core/auth/auth.service';
import { DepartamentoModel, GenericPagination } from './departamentos.types';

@Injectable({ providedIn: 'root' })
export class DepartamentosService {
    //x: string]: any;
    // Private
    private _departamentos: BehaviorSubject<DepartamentoModel[] | null> = new BehaviorSubject(null);
    private _departamento: BehaviorSubject<DepartamentoModel | null> = new BehaviorSubject(null);
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

    get departamentos$(): Observable<DepartamentoModel[]> {
        return this._departamentos.asObservable();
    }

    get departamento$(): Observable<DepartamentoModel> {
        return this._departamento.asObservable();
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
    getDepartamentos(page: number = 0, size: number = 10, sort: string = 'nombre', order: 'asc' | 'desc' | '' = 'asc', search: string = ''):
        Observable<any> {
        const headers = { 'Authorization': 'Bearer ' + this._authService.accessToken }
        return this._httpClient.get<any>(AuthUtils.MUNISYS_BACKEND_URL + "/departamentos/paginado", {
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
                this._departamentos.next(response.data);
            }),
            );
    }




    /**
     * Get Departamento by id
     */
    getDepartamentoById(id: string): Observable<DepartamentoModel> {
        return this._httpClient.get<DepartamentoModel>(AuthUtils.MUNISYS_BACKEND_URL + "/departamentos/" + id)
            .pipe(tap((departamento) => {
                this._departamento.next(departamento);
            }),
            );
    }

   

    /**
     * Crear producto
     */
    crearDepartamento(): Observable<DepartamentoModel> {
        const newDepartamento: DepartamentoModel = {
            id: '0',
            nombre: '',
            fechaAlta: '',
            fechaModificacion: '',
            usuarioAlta: null,
            usuarioModificacion: null,
        };

        return this.departamentos$.pipe(
            take(1),
            map(departamentos => {
                this._departamentos.next([newDepartamento, ...departamentos]);
                return newDepartamento;
            })
        );
    }

    /**
     * Update product
     *
     * @param id
     * @param product
     */
            updateDepartamento(id: string, departamento: DepartamentoModel): Observable<DepartamentoModel> {
                return this.departamentos$.pipe(
                    take(1),
                    switchMap(departamentos =>
                        this._httpClient.put<DepartamentoModel>(AuthUtils.MUNISYS_BACKEND_URL + "/departamentos", departamento).pipe(
                            map((updatedDepartamento) => {
                                const index = departamentos.findIndex(item => item.id === id);
                                departamentos[index] = updatedDepartamento;
                                this._departamentos.next(departamentos);
                                return updatedDepartamento;
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
 deleteDepartamento(id: string): Observable<boolean> {
    const headers = { 'Authorization': 'Bearer ' + this._authService.accessToken };
    console.log("Deleting departamento with id: " + id);
    return this.departamentos$.pipe(
        take(1),
        switchMap(departamentos => this._httpClient.delete(AuthUtils.MUNISYS_BACKEND_URL + "/departamentos/" + id).pipe(
            map(() => { // No necesitamos 'isDeleted' aquí si el backend no lo devuelve explícitamente y solo indica éxito por el 200 OK
                // Filtrar el departamento eliminado del array actual y emitir el nuevo array
                const updatedDepartamentos = departamentos.filter(item => item.id !== id);
                this._departamentos.next([...updatedDepartamentos]); // Emitir una nueva referencia del array

                // Si tu backend devuelve un booleano, puedes mantener 'isDeleted'
                // Para este ejemplo, asumimos que un 200 OK significa éxito
                return true; // Indicamos éxito
            }),
            // Manejo de errores opcional si el backend devuelve un error en la eliminación
            // catchError(error => {
            //     console.error('Error al eliminar el departamento:', error);
            //     return throwError(() => new Error('Error al eliminar el departamento'));
            // })
        )),
    );
}

    createDepartamento(departamento: Partial<DepartamentoModel>): Observable<DepartamentoModel> {
    return this._httpClient.post<DepartamentoModel>(AuthUtils.MUNISYS_BACKEND_URL + "/departamentos", departamento).pipe(
        tap((nuevo) => {
            this._departamentos.pipe(take(1)).subscribe(departamentos => {
                this._departamentos.next([nuevo, ...departamentos]);
            });
        })
    );
}


/**
 * Lista todos los departamentos sin paginación (para usar en selects)
 */
listarDepartamentos(): Observable<DepartamentoModel[]> {
    const headers = {
        'Authorization': 'Bearer ' + this._authService.accessToken
    };
    return this._httpClient.get<DepartamentoModel[]>(AuthUtils.MUNISYS_BACKEND_URL + '/departamentos', { headers }).pipe(
        tap((departamentos) => {
            this._departamentos.next(departamentos);
        })
    );
}



 
}
